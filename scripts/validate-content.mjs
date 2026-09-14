import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'content');
const lessonDir = path.join(contentDir, 'lessons-v1');
const errors = [];
const warnings = [];

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`JSON parse failed: ${path.relative(root, file)} — ${error.message}`);
    return null;
  }
};

const warn = (message) => warnings.push(message);
const fail = (message) => errors.push(message);

function walkJson(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJson(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

// Parse every content JSON file so malformed data can never silently ship.
const allJsonFiles = walkJson(contentDir);
for (const file of allJsonFiles) readJson(file);

const indexPath = path.join(lessonDir, 'index.json');
const index = readJson(indexPath);
const registryPath = path.join(contentDir, 'concept-registry-v1.json');
const registry = fs.existsSync(registryPath) ? readJson(registryPath) : null;
const systemMapPath = path.join(contentDir, 'system-map-v1.json');
const systemMap = fs.existsSync(systemMapPath) ? readJson(systemMapPath) : null;
const crosswalkPath = path.join(contentDir, 'concept-crosswalk-v1.json');
const crosswalk = fs.existsSync(crosswalkPath) ? readJson(crosswalkPath) : null;
const enrichmentPolicyPath = path.join(contentDir, 'enrichment-policy-v1.json');
const enrichmentPolicy = fs.existsSync(enrichmentPolicyPath) ? readJson(enrichmentPolicyPath) : null;
const enrichmentVerificationPath = path.join(contentDir, 'enrichment-verification-v1.json');
const enrichmentVerification = fs.existsSync(enrichmentVerificationPath) ? readJson(enrichmentVerificationPath) : null;

const canonicalConceptIds = new Set((registry?.concepts || []).map(x => x.id));
const systemIds = new Set((systemMap?.systems || []).map(x => x.id));
const systemAliases = systemMap?.aliases || {};
const enrichmentFields = ['meaningZh', 'hanja', 'originType', 'originNote', 'chinese'];
const validEnrichmentStatuses = new Set(['unverified', 'verified', 'mixed']);
const cjkPattern = /[\u3400-\u9FFF\uF900-\uFAFF]/;

for (const [alias, target] of Object.entries(systemAliases)) {
  if (!systemIds.has(target)) fail(`system-map alias '${alias}' points to unknown system '${target}'`);
}

const resolveSystemId = (value) => {
  if (systemIds.has(value)) return value;
  if (systemAliases[value] && systemIds.has(systemAliases[value])) return systemAliases[value];
  return null;
};

if (!index) {
  fail('Missing or unreadable content/lessons-v1/index.json');
} else if (!Array.isArray(index.packs)) {
  fail('Lesson index must contain a packs array.');
}

const globalIds = new Map();
const listedLessonIds = new Set();
const lessonGrammarIds = new Map();
const lessonItemIds = new Map();

function checkSourceRefs(item, context) {
  if (!item || !Array.isArray(item.sourceRefs) || item.sourceRefs.length === 0) {
    warn(`${context}: missing sourceRefs`);
    return;
  }
  for (const [i, ref] of item.sourceRefs.entries()) {
    if (!ref || typeof ref !== 'object') {
      warn(`${context}: sourceRefs[${i}] is not an object`);
      continue;
    }
    if (!ref.file && ref.type !== 'generated') warn(`${context}: sourceRefs[${i}] has no file`);
    if (ref.file && !('slide' in ref) && !('slides' in ref) && !('notes' in ref) && !('type' in ref)) {
      warn(`${context}: sourceRefs[${i}] has a file but no slide/slides/notes/type locator`);
    }
  }
}

function collectItemId(item, context, localIds) {
  if (!item?.id) {
    fail(`${context}: item is missing id`);
    return;
  }
  if (localIds.has(item.id)) fail(`${context}: duplicate id inside lesson pack: ${item.id}`);
  localIds.add(item.id);

  const previous = globalIds.get(item.id);
  if (previous && previous !== context) {
    // Cross-file duplicates may later become intentional shared IDs, so warn instead of failing.
    warn(`Cross-pack duplicate id ${item.id}: ${previous} and ${context}`);
  } else {
    globalIds.set(item.id, context);
  }
}

function usesEnrichmentFields(data) {
  for (const groupName of ['vocabulary', 'expressions']) {
    for (const item of data[groupName] || []) {
      if (enrichmentFields.some(field => item[field])) return true;
    }
  }
  return false;
}

function checkEnrichmentPolicy(data, context) {
  if (!usesEnrichmentFields(data)) return;

  const sourcePolicy = data.sourcePolicy;
  const sourceLayers = sourcePolicy?.sourceLayers;
  const enrichmentQa = sourcePolicy?.enrichmentQa;

  if (!sourceLayers?.teacherSource || !sourceLayers?.verifiedEnrichment || !sourceLayers?.unverifiedEnrichment) {
    fail(`${context}: enrichment fields require sourcePolicy.sourceLayers with teacherSource, verifiedEnrichment, and unverifiedEnrichment`);
  }

  if (!enrichmentQa) {
    fail(`${context}: enrichment fields require sourcePolicy.enrichmentQa`);
    return;
  }

  if (!validEnrichmentStatuses.has(enrichmentQa.status)) {
    fail(`${context}: enrichmentQa.status must be one of ${[...validEnrichmentStatuses].join(', ')}`);
  }

  const accountedFields = new Set([
    ...(enrichmentQa.verifiedFields || []),
    ...(enrichmentQa.unverifiedFields || [])
  ]);
  for (const field of enrichmentFields.filter(field => field !== 'chinese')) {
    if (!accountedFields.has(field)) {
      fail(`${context}: enrichment field '${field}' must be listed in verifiedFields or unverifiedFields`);
    }
  }
}

function checkVocabularyEnrichment(item, context) {
  if (item.hanja && !cjkPattern.test(item.hanja)) {
    fail(`${context}: hanja field must contain at least one CJK/Hanja character`);
  }
  if (item.hanja && item.originType && /^native-korean/.test(item.originType)) {
    warn(`${context}: native-korean originType also has Hanja; verify this is intentional mixed/lexicalized usage`);
  }
}

if (!enrichmentPolicy) {
  fail('Missing content/enrichment-policy-v1.json');
} else {
  const tierIds = new Set((enrichmentPolicy.tiers || []).map(tier => tier.id));
  for (const tierId of ['teacher-source', 'verified-enrichment', 'unverified-enrichment']) {
    if (!tierIds.has(tierId)) fail(`enrichment-policy: missing tier '${tierId}'`);
  }
  for (const field of enrichmentFields) {
    if (field === 'chinese') continue;
    if (!(enrichmentPolicy.fieldClassification?.requiresEnrichmentQa || []).includes(field)) {
      fail(`enrichment-policy: requiresEnrichmentQa must include '${field}'`);
    }
  }
}

for (const pack of index?.packs || []) {
  const lessonId = pack.lessonId;
  const fileName = pack.file;
  if (!lessonId || !fileName) {
    fail('Every index pack needs lessonId and file.');
    continue;
  }
  listedLessonIds.add(lessonId);
  const filePath = path.join(lessonDir, fileName);
  if (!fs.existsSync(filePath)) {
    fail(`${lessonId}: indexed file does not exist: ${fileName}`);
    continue;
  }

  const data = readJson(filePath);
  if (!data) continue;
  checkEnrichmentPolicy(data, lessonId);
  const lesson = data.lesson;
  if (!lesson?.id || lesson.id !== lessonId) fail(`${lessonId}: lesson.id must equal index lessonId`);
  if (!Number.isInteger(lesson?.number)) fail(`${lessonId}: lesson.number must be an integer`);
  if (!lesson?.theme) fail(`${lessonId}: lesson.theme is required`);
  checkSourceRefs(lesson, `${lessonId}.lesson`);

  if (Array.isArray(lesson?.connections)) {
    for (const connection of lesson.connections) {
      if (!resolveSystemId(connection)) {
        warn(`${lessonId}: connection '${connection}' cannot be resolved to a system-map ID`);
      }
    }
  }

  const localIds = new Set();
  const groups = [
    ['vocabulary', data.vocabulary],
    ['grammar', data.grammar],
    ['expressions', data.expressions],
    ['culture', data.culture],
    ['practice', data.practice]
  ];

  for (const [groupName, items] of groups) {
    if (items == null) continue;
    if (!Array.isArray(items)) {
      fail(`${lessonId}.${groupName}: expected an array`);
      continue;
    }
    for (const [i, item] of items.entries()) {
      const context = `${lessonId}.${groupName}[${i}]`;
      collectItemId(item, context, localIds);
      if (groupName !== 'practice') checkSourceRefs(item, context);

      if (groupName === 'vocabulary') {
        if (!item.korean || !item.meaningEn) fail(`${context}: vocabulary needs korean and meaningEn`);
        if (item.hanja && !data.sourcePolicy?.generatedEnrichment) {
          warn(`${context}: Hanja is present but pack does not declare generatedEnrichment/source policy`);
        }
        checkVocabularyEnrichment(item, context);
      }
      if (groupName === 'grammar') {
        if (!item.pattern || !item.meaning) fail(`${context}: grammar needs pattern and meaning`);
      }
      if (groupName === 'expressions') {
        if (!item.korean || !item.meaningEn) fail(`${context}: expression needs korean and meaningEn`);
        checkVocabularyEnrichment(item, context);
      }
      if (groupName === 'practice') {
        if (!item.type || !item.prompt || !Array.isArray(item.answers) || item.answers.length === 0) {
          fail(`${context}: practice needs type, prompt, and at least one answer`);
        }
      }
    }
  }

  lessonItemIds.set(lessonId, localIds);
  lessonGrammarIds.set(lessonId, new Set((data.grammar || []).map(item => item.id).filter(Boolean)));

  // Resolve practice references after all local IDs have been collected.
  // A practice item may target a local lesson item, canonical cross-lesson concept, or whole system page.
  for (const [i, item] of (data.practice || []).entries()) {
    for (const conceptId of item.conceptIds || []) {
      if (!localIds.has(conceptId) && !canonicalConceptIds.has(conceptId) && !resolveSystemId(conceptId)) {
        warn(`${lessonId}.practice[${i}]: unresolved conceptId '${conceptId}'`);
      }
    }
  }
}

// Verified enrichment register checks.
if (!enrichmentVerification) {
  fail('Missing content/enrichment-verification-v1.json');
} else {
  if (!Array.isArray(enrichmentVerification.sources) || enrichmentVerification.sources.length === 0) {
    fail('enrichment-verification: sources must be a non-empty array');
  }
  if (!Array.isArray(enrichmentVerification.verifiedItems)) {
    fail('enrichment-verification: verifiedItems must be an array');
  }

  const sourceIds = new Set();
  for (const [i, source] of (enrichmentVerification.sources || []).entries()) {
    if (!source.id || !source.label || !source.url) {
      fail(`enrichment-verification sources[${i}] missing id/label/url`);
      continue;
    }
    if (sourceIds.has(source.id)) fail(`enrichment-verification duplicate source ID: ${source.id}`);
    sourceIds.add(source.id);
  }

  const seenVerifiedIds = new Set();
  for (const [i, entry] of (enrichmentVerification.verifiedItems || []).entries()) {
    const context = `enrichment-verification verifiedItems[${i}]`;
    if (!entry.id || !entry.lessonId || !entry.itemId) {
      fail(`${context}: id, lessonId, and itemId are required`);
      continue;
    }
    if (seenVerifiedIds.has(entry.id)) fail(`${context}: duplicate verification ID '${entry.id}'`);
    seenVerifiedIds.add(entry.id);

    const itemIds = lessonItemIds.get(entry.lessonId);
    if (!itemIds) {
      fail(`${context}: unknown lessonId '${entry.lessonId}'`);
    } else if (!itemIds.has(entry.itemId)) {
      fail(`${context}: itemId '${entry.itemId}' does not exist in ${entry.lessonId}`);
    }

    if (!Array.isArray(entry.verifiedFields) || entry.verifiedFields.length === 0) {
      fail(`${context}: verifiedFields must be a non-empty array`);
    } else {
      for (const field of entry.verifiedFields) {
        if (!enrichmentFields.includes(field) || field === 'chinese') {
          fail(`${context}: '${field}' is not a supported verifiable enrichment field`);
        }
        if (!(field in (entry.values || {}))) {
          fail(`${context}: values.${field} is required for every verified field`);
        }
      }
    }

    if (!Array.isArray(entry.evidence) || entry.evidence.length === 0) {
      fail(`${context}: evidence must be a non-empty array`);
    } else {
      for (const [evidenceIndex, evidence] of entry.evidence.entries()) {
        if (!sourceIds.has(evidence.sourceId)) {
          fail(`${context}.evidence[${evidenceIndex}]: unknown sourceId '${evidence.sourceId}'`);
        }
        if (!Array.isArray(evidence.fields) || evidence.fields.length === 0) {
          fail(`${context}.evidence[${evidenceIndex}]: fields must be a non-empty array`);
        } else {
          for (const field of evidence.fields) {
            if (!entry.verifiedFields?.includes(field)) {
              fail(`${context}.evidence[${evidenceIndex}]: field '${field}' is not listed in verifiedFields`);
            }
          }
        }
        if (!evidence.lookupUrl && !evidence.notes) {
          warn(`${context}.evidence[${evidenceIndex}]: add lookupUrl or notes for traceability`);
        }
      }
    }
  }

  for (const pack of index?.packs || []) {
    const lessonId = pack.lessonId;
    const filePath = path.join(lessonDir, pack.file);
    const data = fs.existsSync(filePath) ? readJson(filePath) : null;
    const verifiedItemIds = data?.sourcePolicy?.enrichmentQa?.verifiedItemIds || [];
    for (const itemId of verifiedItemIds) {
      const hasVerification = (enrichmentVerification.verifiedItems || []).some(entry => entry.lessonId === lessonId && entry.itemId === itemId);
      if (!hasVerification) fail(`${lessonId}: verifiedItemIds includes '${itemId}' without an enrichment-verification entry`);
    }
  }
}

for (const lessonId of index?.completedBatch || []) {
  if (!listedLessonIds.has(lessonId)) warn(`completedBatch contains ${lessonId}, but it is not listed in packs`);
}

// Registry checks.
if (registry) {
  const seen = new Set();
  for (const [i, concept] of (registry.concepts || []).entries()) {
    if (!concept.id || !concept.system || !concept.labelEn) fail(`concept-registry concepts[${i}] missing id/system/labelEn`);
    if (seen.has(concept.id)) fail(`concept-registry duplicate canonical ID: ${concept.id}`);
    seen.add(concept.id);
    if (concept.system && !systemIds.has(concept.system)) warn(`concept ${concept.id}: unknown system '${concept.system}'`);
  }
}

// Crosswalk checks: every grammar item must be intentionally mapped or explicitly local-only.
if (crosswalk) {
  const accounted = new Map();
  const account = (entry, kind, indexNumber) => {
    const context = `concept-crosswalk ${kind}[${indexNumber}]`;
    if (!entry?.lessonId || !entry?.localId) {
      fail(`${context}: lessonId and localId are required`);
      return;
    }
    const grammarIds = lessonGrammarIds.get(entry.lessonId);
    if (!grammarIds) {
      fail(`${context}: unknown lessonId '${entry.lessonId}'`);
      return;
    }
    if (!grammarIds.has(entry.localId)) {
      fail(`${context}: '${entry.localId}' is not a grammar ID in ${entry.lessonId}`);
      return;
    }
    const key = `${entry.lessonId}::${entry.localId}`;
    if (accounted.has(key)) {
      fail(`${context}: ${key} is already accounted for as ${accounted.get(key)}`);
      return;
    }
    accounted.set(key, kind);

    if (kind === 'mappings') {
      if (!Array.isArray(entry.canonicalIds) || entry.canonicalIds.length === 0) {
        fail(`${context}: canonicalIds must be a non-empty array`);
      } else {
        for (const canonicalId of entry.canonicalIds) {
          if (!canonicalConceptIds.has(canonicalId)) fail(`${context}: unknown canonical concept '${canonicalId}'`);
        }
      }
    }
    if (kind === 'localOnly' && !entry.reason) warn(`${context}: localOnly item should explain why it remains local`);
  };

  for (const [i, entry] of (crosswalk.mappings || []).entries()) account(entry, 'mappings', i);
  for (const [i, entry] of (crosswalk.localOnly || []).entries()) account(entry, 'localOnly', i);

  for (const [lessonId, grammarIds] of lessonGrammarIds.entries()) {
    for (const localId of grammarIds) {
      const key = `${lessonId}::${localId}`;
      if (!accounted.has(key)) fail(`concept-crosswalk: unaccounted grammar ID ${key}`);
    }
  }
}

console.log(`Validated ${allJsonFiles.length} JSON files and ${index?.packs?.length || 0} lesson packs.`);
if (crosswalk) console.log(`Validated canonical grammar crosswalk for ${lessonGrammarIds.size} lessons.`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const message of warnings) console.log(`  - ${message}`);
}
if (errors.length) {
  console.error(`\nErrors (${errors.length}):`);
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

if (process.env.STRICT_WARNINGS === '1' && warnings.length) process.exit(2);
console.log('\nContent validation passed.');
