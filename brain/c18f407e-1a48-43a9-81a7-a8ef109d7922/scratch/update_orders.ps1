
$p = 'c:\Users\Afiss\Documents\eshop\frontend\src\component\Admin\Order\OrdersAdmin.jsx'
$c = Get-Content $p -Raw
$c = $c -replace 'export default function OrdersAdmin\(\)', 'export default function OrdersAdmin({ globalSearchQuery = "" })'
$c = $c -replace 'const matchesSearch = o.id.toLowerCase\(\).includes\(searchTerm.toLowerCase\(\)\) \|\|', 'const query = (searchTerm || globalSearchQuery).toLowerCase(); const matchesSearch = o.id.toLowerCase().includes(query) ||'
$c = $c -replace 'o.user_id.toLowerCase\(\).includes\(searchTerm.toLowerCase\(\)\);', 'o.user_id.toLowerCase().includes(query) || (o.customer_name && o.customer_name.toLowerCase().includes(query));'
Set-Content $p $c -Encoding UTF8
