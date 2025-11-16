# Data Reset Script

## Overview

The `reset-data.sh` script resets all ERP system data to its initial state. This is useful for:
- Development environment setup
- Testing scenarios
- Starting fresh with clean data
- Resetting after demo sessions

## What Gets Reset

### Data Files (Reset to Empty Arrays)
The following data files are reset to empty arrays `[]`:
- `addresses.json`
- `customers.json`
- `inventory.json`
- `orders.json`
- `products.json`
- `purchase_orders.json`
- `rmas.json`
- `sfcs.json`
- `users.json`
- `vendors.json`
- `warehouses.json`

### Counter Files (Reset to Initial Values)
The following counter files are reset to their initial values:

| Counter File | Initial Value | Description |
|-------------|---------------|-------------|
| `order_counter.json` | 1000000 | Order number sequence |
| `invoice_counter.json` | 1000000 | Invoice number sequence |
| `po_counter.json` | 1000000 | Purchase order number sequence |
| `po_invoice_counter.json` | 1000000 | PO invoice number sequence |
| `rma_counter.json` | 1000000 | RMA number sequence |
| `sfc_counter.json` | 1000000 | Shop Floor Control number sequence |

## Usage

### Basic Usage

```bash
cd server
./reset-data.sh
```

### What Happens

1. **Confirmation Prompt**: The script asks for confirmation before proceeding
2. **Backup Option**: You can choose to create a backup of existing data
3. **Data Reset**: All data files are reset to empty arrays
4. **Counter Reset**: All counters are reset to their initial values
5. **Summary**: A summary of what was reset is displayed

### Example Output

```
==========================================
  ERP System - Data Reset Script
==========================================

[WARNING] This script will:
  1. Reset all data files to empty arrays []
  2. Reset all counters to their initial values
  3. Create a backup of existing data (optional)

[WARNING] WARNING: This will DELETE all existing data!

Do you want to continue? (yes/no): yes
Create backup before reset? (yes/no): yes
[INFO] Creating backup in: data_backup_20250115_143022
[INFO] Backup created successfully

[INFO] Starting data reset...

[INFO] Resetting data files...
[INFO] Reset: addresses.json
[INFO] Reset: customers.json
...

[INFO] Resetting counter files...
[INFO] Reset: order_counter.json to 1000000
[INFO] Reset: invoice_counter.json to 1000000
[INFO] Reset: po_counter.json to 1000000
[INFO] Reset: po_invoice_counter.json to 1000000
[INFO] Reset: rma_counter.json to 1000000
[INFO] Reset: sfc_counter.json to 1000000
...

[INFO] ==========================================
[INFO] Data reset completed successfully!
[INFO] ==========================================
```

## Safety Features

1. **Confirmation Required**: The script requires explicit "yes" confirmation
2. **Optional Backup**: You can create a backup before resetting
3. **Error Handling**: Script exits on errors (set -e)
4. **Clear Warnings**: Prominent warnings about data deletion

## Backup

If you choose to create a backup, it will be created in a directory named:
```
data_backup_YYYYMMDD_HHMMSS
```

The backup contains a copy of all files in the `data/` directory before the reset.

## Important Notes

⚠️ **WARNING**: This script permanently deletes all data. Use with caution!

- Always create a backup if you have important data
- This script is intended for development/testing environments
- Do not run this script in production without proper authorization
- The script will create missing data files if they don't exist

## Troubleshooting

### Permission Denied
If you get a "permission denied" error:
```bash
chmod +x reset-data.sh
```

### Data Directory Not Found
The script will automatically create the `data/` directory if it doesn't exist.

### Counter Values
All counters are reset to **1000000** when using the reset script. Note that the repository classes may have different initial values defined in code, but the reset script will set all counters to 1000000.

## Related Files

- Data files location: `server/data/`
- Repository classes: `server/src/main/java/com/edge/repository/`

