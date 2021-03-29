## Implementation

### Repo

- Separate repo for aideme-web-api
- Install AIDEme python package: git+ssh://git@gitlab.inria.fr/ldipalma/aideme.git

### Branches

- Master git branch: support one user, run on local computer
- Web git branch: support multiple users, manage sessions using cookies and redis, out-of-date with the frontend, for reference only.

### Notes

- The backend is built with flask.
- The dataset is kept in the browser for the entire session for displaying plots, labeling samples, and showing history.
- All client-server (frontend-backend) communications only use row and column ids (data is not included in the requests and responses).
- Categorical columns are not identical between front and back: for display (front), categorical if object (back).
- Predictions: points need to be sorted by ids

## Endpoints

### Interactive session

- POST /new-session

- POST /choose-options

- POST /get-points-by-filtering

- POST /data-point-were-labeled

- GET /get-model-predictions-over-grid-point

- GET /get-tsm-predictions-over-grid-point

- GET /get-labeled-dataset

### Trace session

- POST /start-trace

- POST /get-next-traces

### Other endpoints in the Java backend:

- /get-specific-point-to-label (Disabled in GUI)

- /fake-point-initial-sampling (Disabled in GUI)

- /get-fake-point-grid (Disabled in GUI)

- /get-decision-boundaries (Disabled in GUI)

- /get-visualization-data (Not in GUI)
