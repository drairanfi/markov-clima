## ADDED Requirements

### Requirement: Initial state selection
The UI SHALL let the user choose the initial state among the chain states and SHALL update
all results when it changes.

#### Scenario: Change initial state
- **WHEN** the user selects "Rainy"
- **THEN** the results table reflects an initial distribution of [0, 0, 1]

### Requirement: Prediction table for 1, 3, 5 and 10 steps
The UI SHALL show a table with one row per horizon (1, 3, 5, 10) and one column per state,
with probabilities formatted as percentages with 2 decimals.

#### Scenario: Table content
- **WHEN** the page loads with the default chain
- **THEN** the table has 4 rows and 3 state columns and every row sums to 100%

### Requirement: Charts
The UI SHALL render (a) a grouped bar chart of the distributions at 1, 3, 5, 10 steps and
(b) a line chart of the probability of each state for steps 0 to 10, plus a marker for the
stationary distribution.

#### Scenario: Charts present
- **WHEN** the page loads
- **THEN** two canvas elements for charts exist and their datasets match the computed data

#### Scenario: Chart data builder
- **WHEN** the chart data is built for the default chain
- **THEN** the line chart has 11 labels (0..10) and one dataset per state

### Requirement: Editable transition matrix
The UI SHALL display the transition matrix as editable numeric inputs, SHALL show the row
sums, and SHALL block predictions and show an error when validation fails.

#### Scenario: Invalid edit
- **WHEN** the user changes a cell so a row no longer sums to 1
- **THEN** an error message is visible, the row sum is flagged, and previous results are cleared

#### Scenario: Reset
- **WHEN** the user clicks "Reset matrix"
- **THEN** the default matrix is restored and the error disappears

### Requirement: Accessibility basics
The UI SHALL label every input and expose error messages with role="alert".

#### Scenario: Labelled controls
- **WHEN** the page loads
- **THEN** the initial-state select and every matrix input have an accessible label
