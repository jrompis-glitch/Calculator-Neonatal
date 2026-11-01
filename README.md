# EOS Kaiser 2017 / 2024 — module for Vercel static site

Files: eos.html and eos.js. Place both in the same directory as the existing app's index.html. Add a card/link in the existing index.html pointing to `eos.html`.

IMPORTANT: This is a **pre-validation integration candidate**, not a clinically validated medical device. Before patient use, compare both models' outputs against the official Kaiser calculator across representative edge cases, especially 2017 incidence calibration, intrapartum antibiotics and recommendations. The clinical recommendation text is intentionally a simplified threshold-based guidance, NOT the full Kaiser management algorithm.

2024 source: https://neonatalsepsiscalculator.kaiserpermanente.org/ModelUpdateFAQ.aspx
2017 source: https://neonatalsepsiscalculator.kaiserpermanente.org/EmrFAQ.aspx
Official tool: https://neonatalsepsiscalculator.kaiserpermanente.org/

The 2024 model adjusts the 57.29929499 intercept from baseline incidence 0.2763/1000 using the difference in log-odds. The 2017 model uses the published 47.8398 base intercept and a provisional incidence adjustment; verify this against the official 2017 implementation before clinical deployment.
