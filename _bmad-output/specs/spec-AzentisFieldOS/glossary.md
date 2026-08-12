# Glossary

Every domain noun this contract uses. Defined once; used verbatim everywhere else.

- **Tenant** — One contractor company's fully isolated instance of the platform: its own branding, sites, materials, team, vendors, and data. No cross-tenant access, ever.
- **Contractor / Company** — The tenant-owning business.
- **Site / Project** — A single construction contract/location the contractor manages. Has its own activity, stock, labour, and expense records, rolled up to the Contractor level.
- **Godown** — The tenant's central warehouse where purchased material is stored before being sent to a Site.
- **Material** — A configurable inventory item (e.g., Cement, RCC Pipe). Belongs to an admin-defined Category, may have multiple Sizes/Specifications, tracked in a defined Unit.
- **Size / Specification** — A configurable variant of a Material (e.g., RCC Pipe 300mm vs 450mm). Not hardcoded.
- **Unit (of Measure)** — Configurable measurement unit (Bags, Cubic metres, Tonnes, etc.) attached to a Material.
- **Stock** — Quantity of a Material (at a given Size) currently held, tracked separately as **Godown Stock** and **Site Stock**.
- **Purchase** — A recorded acquisition of Material from a Vendor, destined for either the Godown or directly to a Site.
- **Material Movement** — Any transaction that moves Material: Godown→Site, Site→Site. Reduces source Stock, increases destination Stock.
- **Consumption** — Material recorded as used at a Site against an activity, reducing Site Stock.
- **Wastage / Return** — Material recorded as lost, damaged, or returned, distinct from Consumption.
- **Machinery** — A tracked piece of equipment (JCB, mixer, etc.) with a current Site/location and usage/maintenance history.
- **Vehicle** — A tracked transport asset (truck, dumper, etc.) with a current Site/location, driver, and usage/maintenance history.
- **Team Member** — A person in the tenant's shared labour pool. Not permanently assigned to a Site.
- **Work Record** — A Team Member's recorded attendance/activity at a specific Site on a specific date.
- **Advance** — Cash given to a Team Member ahead of earned pay. Has a running Outstanding Balance.
- **Advance Adjustment** — An owner-initiated, manually-sized reduction of an Advance's Outstanding Balance against a Payment. Never automatic.
- **Payment** — A recorded amount paid to a Team Member (weekly, monthly, or daily-wage), net of any Advance Adjustment applied.
- **RMC (Ready-Mix Concrete)** — Concrete purchased from an external vendor, tracked by volume (m³), grade, and cost, separate from Material inventory.
- **Daily Site Report (DSR)** — The Site Supervisor's once-daily structured log of a Site's activity, labour, material, RMC, machinery/vehicle use, expenses, issues, and photos.
- **Vendor** — A supplier of Material, RMC, or services, with purchase and payment history.
- **Expense** — Any recorded cost not otherwise captured as a Purchase (fuel, repairs, transport, misc.), tied to a Site and Category.
- **Role** — **Owner/Admin** (full tenant access, configuration, all sites) or **Site Supervisor** (mobile DSR entry, scoped to whichever Site they're actively logging for, not permanently bound to one). These are the only two in-app roles.
- **Platform Operator** — Not an application role. The capability of provisioning a new Tenant, held by whoever has credentials to the provisioning tooling and underlying cloud accounts. See architecture companion, AD-11.
- **Custom Field** — An admin-defined additional data field attached to a Material, Machine, Vehicle, or other configurable entity.
