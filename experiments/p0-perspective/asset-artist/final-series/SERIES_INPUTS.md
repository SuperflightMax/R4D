# P0 final series — общие разрешённые входы

- Frozen Concept source commit: `ae82913a18cf0beed2b67f1c421b30e1c1988e3b`; локальный cherry-pick: `3d3ae34`.
- Frozen Builder source commit: `0260519c5e3ff74365556713042d576b7bbec66e`; локальный cherry-pick: `dd2d096`.
- Необходимый Builder L1 dependency для полного check: source `9a8a01002672398bf171d540c50009c32c4a8f9d`; локальный cherry-pick: `7cb72f7`.
- Frozen Visual QA, разрешивший единственную F1 plate correction: source `91b11a2090dd1ce00c9603c9d88fa73d42ed0f4c`; локальный cherry-pick: `659ce48`.
- Image 1, единственный geometry/camera control: `../../d1/inputs/formal-reference-v1.png`, SHA-256 `08ebe1bd5dd7e3a60097a15c1e29e60c46c4bcf27e4babda730fcffa269f723f`.
- Image 2, art-quality reference only, read-only: `K:\Agents\R4D\Assets\perspective\03-sun-temple.jpg`, SHA-256 `f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32`.

L1 plate/master/shadow и outputs F1–F4 не используются как generation inputs. Каждая invocation получает только два входа выше и свой заранее сохранённый prompt.
