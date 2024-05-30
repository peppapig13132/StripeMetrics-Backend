# STRIPE DASHBOARD (BE)

## Dashboard Widget Endpoints

- [x] MRR
- [x] Subscribers
- [x] MRR Movements
- [x] Average Staying
- [ ] Customer Lifetime Value
- [x] Customer Churn Rate
- [x] Free to paid subscriptions
- [x] Free trials
- [x] Annual Run Rate


## Calculation

### Customer Churn Rate

```
Churn Rate = (Number of Canceled Subscriptions / Number of Active Subscriptions at the Start) * 100
```

### Annual Run Rate

Be sure, Annual Run Rate calcualted by following formular as the provider has only monthly subscriptions.
```
Annual Run Rate = MRR * 12
```


## Environment

- Node.js v20.12.2 (LTS)
- npm v10.6.0
- PostgreSQL v16.2
