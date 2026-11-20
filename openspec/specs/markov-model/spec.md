# markov-model Specification

## Purpose

TBD - created by archiving change markov-weather-predictor. Update Purpose after archive.

## Requirements

### Requirement: Transition matrix validation
The system SHALL accept a chain only if it has at least 3 states, the matrix is square with
size equal to the number of states, every entry is in [0, 1], and every row sums to 1
within 1e-6.

#### Scenario: Valid default chain
- **WHEN** the default weather chain (Sunny, Cloudy, Rainy) is validated
- **THEN** validation succeeds with no errors

#### Scenario: Row does not sum to 1
- **WHEN** a row sums to 0.9
- **THEN** validation fails and the error names the offending row

#### Scenario: Fewer than 3 states
- **WHEN** a chain with 2 states is validated
- **THEN** validation fails with a "minimum 3 states" error

#### Scenario: Negative or >1 probability
- **WHEN** any entry is below 0 or above 1
- **THEN** validation fails and the error names the cell

### Requirement: One-step transition
The system SHALL compute the next distribution as the product of the current distribution
(row vector) and the transition matrix.

#### Scenario: Start Sunny
- **GIVEN** the default chain and initial distribution [1, 0, 0]
- **WHEN** one step is computed
- **THEN** the result equals the first matrix row [0.7, 0.2, 0.1]

### Requirement: N-step prediction
The system SHALL compute the distribution after n steps for any integer n >= 0, and the
result SHALL always sum to 1 within 1e-9.

#### Scenario: Zero steps
- **WHEN** n = 0
- **THEN** the result equals the initial distribution

#### Scenario: Required horizons
- **WHEN** predictions are requested for n = 1, 3, 5 and 10
- **THEN** one distribution is returned per horizon, in that order

#### Scenario: Vector iteration equals matrix power
- **WHEN** the n-step distribution is computed by repeated steps and by P^n
- **THEN** both agree within 1e-9 for n = 1, 3, 5, 10

#### Scenario: Known value
- **GIVEN** the default chain and initial state Sunny
- **WHEN** n = 3
- **THEN** the distribution is [0.51, 0.268, 0.222] (hand-computed: step 1 = [0.7, 0.2, 0.1], step 2 = [0.57, 0.25, 0.18])

### Requirement: Invalid prediction input
The system SHALL reject an initial distribution that has the wrong length, negative entries,
or does not sum to 1, and SHALL reject negative or non-integer n.

#### Scenario: Wrong length
- **WHEN** the initial vector has 2 entries for a 3-state chain
- **THEN** an error is raised

#### Scenario: Negative steps
- **WHEN** n = -1
- **THEN** an error is raised

### Requirement: Stationary distribution
The system SHALL compute the long-run distribution pi such that pi = pi P, and SHALL report
whether the computation converged.

#### Scenario: Default chain converges
- **WHEN** the stationary distribution of the default chain is computed
- **THEN** it converges, sums to 1, and satisfies pi P = pi within 1e-9

#### Scenario: Periodic chain
- **GIVEN** a deterministic 3-cycle chain
- **WHEN** the stationary distribution is computed from a non-uniform start
- **THEN** the result reports converged = false instead of looping forever
