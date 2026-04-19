# fi-ledger

This is a microservice for handling data from real finance providers (Capital One, Fidelity, etc.) to the Financial-Independence-Tracker App

## Architecture

1. Expose and endpoint to allow a post with user id, source tag, and source data.
2. Validate the user id against supabase.
3. Validate the source tag is supported and the source data is valid.
4. Parse the data.
5. Post to supabase tables.
6. Post to mongodb for ?

## Resources

- https://github.com/LucasRGoes/ports-adapters-sample
- https://feathersjs.com/