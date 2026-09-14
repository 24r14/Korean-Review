# Access and media notes

This site is published with GitHub Pages, so it is a static website. The class access screen in `access-gate.js` is useful for casual class use, but it is not real private account security.

## Teacher-owned PPT material

- Do not upload teacher PPT screenshots, original slide images, or copied slide layouts.
- The lesson JSON should keep teacher-derived learning structure separate from enrichment.
- Hanja, Chinese glosses, word origins, English loanword notes, generated visuals, and extra examples should remain clearly marked as enrichment unless verified.

## Real photos

Real food and culture photos are allowed only when the image rights are clear:

- use your own photos;
- use photos the teacher explicitly approves for this site;
- use public-domain or Creative Commons photos with the required credit;
- use permissive stock photos only when the license allows educational website use.

Until a rights-safe photo is chosen, the site uses original generated-style SVG illustrations instead of PPT or random web images.

## Different students or classes

For ordinary class sharing, one shared class passcode is enough. Rotate it each semester or whenever you share the site with a new group.

For multiple classes, add separate usernames in `access-gate.js`. Each class can have a different password hash and label, but this is still only a lightweight gate.

For true per-student accounts, private progress syncing, or different permissions per person, move the site to hosting with real authentication, such as a school-managed platform, GitHub Enterprise private Pages, Firebase, Supabase, Netlify, Vercel, or Cloudflare with an authentication layer.

## Student progress

Progress, mistakes, favorites, and feedback are saved in each student's browser. If two people share one computer profile, they share the same saved progress. Separate browser profiles or different devices keep progress separate.
