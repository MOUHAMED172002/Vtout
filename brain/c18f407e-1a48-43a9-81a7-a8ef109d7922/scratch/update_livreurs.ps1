
$p = 'c:\Users\Afiss\Documents\eshop\frontend\src\component\Admin\AdminDelivery\LivreurManager.jsx'
$c = Get-Content $p -Raw
$c = $c -replace 'export default function LivreurManager\(\)', 'export default function LivreurManager({ globalSearchQuery = "" })'
$c = $c -replace 'const \[search, setSearch\] = useState\(\"\"\);', 'const [search, setSearch] = useState("");'
$c = $c -replace 'const filteredLivreurs = livreurs.filter\(l => {', 'const filteredLivreurs = livreurs.filter(l => { const query = (search || globalSearchQuery).toLowerCase();'
$c = $c -replace 'l.user\?.email\?.toLowerCase\(\).includes\(search.toLowerCase\(\)\) \|\|', 'l.user?.email?.toLowerCase().includes(query) ||'
$c = $c -replace 'l.user\?.first_name\?.toLowerCase\(\).includes\(search.toLowerCase\(\)\) \|\|', 'l.user?.first_name?.toLowerCase().includes(query) ||'
$c = $c -replace 'l.user\?.last_name\?.toLowerCase\(\).includes\(search.toLowerCase\(\)\)', 'l.user?.last_name?.toLowerCase().includes(query) || l.user?.phone?.includes(query)'
Set-Content $p $c -Encoding UTF8
