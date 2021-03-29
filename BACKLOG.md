The issues and suggestions for frontend and backend are listed below.

## Progress bar

- Data input -> Attribute selection -> Initial sampling -> Algo selection -> Exploration
- Allow user to go back ?

## Attribute selection

- Load list of columns slowly if many columns
- Makers overlap with axes: histogram plots and prediction plots
- Histogram plots: the ticks (the distinct values of a categorical attribute) of the axis don’t match the corresponding markers for categorical attributes

## Initial sampling

- Faceted search: replace slides with text boxes for Min, Max
- Faceted search: expand PointLabelisation table
- Faceted search: inform user if there are more points (current limit: 25)

## Algo selection

- Factorization: push Edit button to the right
- Not allow Factorization if attributes are not selected

- Change Start session to button

## Exploration

- Labeling: inform user when rows are exhausted

- Model behavior: persist chosen variables in plots
- Model behavior: should show original categorical values
- Model behavior: MIN and MAX for categorical attributes ==> should show a list of distinct values
- Model behavior: add help text to explain how point colors change ?

- Change Auto-labeling to button

- Exploration and TSMExploration have a lot of common code ==> should refactor into one component, use different table components for factorization and non-factorization cases

## Trace

- Modify BreadCrum
- Check if there is a limit when plotting model predictions
- Test all traces on AIDEme python

## Web version

- Check file extension and file size: front + back
- How to securely handle column names ?

- Remove data.csv files periodically (cron) / store them in redis ?
- Redis expiry time: 2 days ?
- Delete csv file after POST choose-options ?

- For all requests, check if a session is still valid, if not redirect to create session
- Use flask’s before-request method ?
- Use flask’s custom decorator ?

- Replace demo implementation of cache with redis (refer to web branch)

- Request for next point to label and predictions together ?
- Request for model and polytope predictions together ?
- Reduce requests by sending several points to label each time ?

- Deploy

## Django server

- Bug - frontend: undefined session id sent to django server
