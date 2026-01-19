## 2024-05-22 - Do Not Commit Lockfiles

**Learning:** Including a `pnpm-lock.yaml` file in a pull request is considered a significant, out-of-scope change that can obscure the primary purpose of the PR and introduce unnecessary risk. It was a blocking issue in the code review.

**Action:** Always ensure lockfiles are not staged or included in commits for feature or optimization work. If a dependency change is necessary, it should be done in a separate, dedicated PR.