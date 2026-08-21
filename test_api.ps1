Add-Type -AssemblyName System.Net.Http
$base = "http://localhost:5000/api"
$results = @()

function Test($name, $ok, $detail) {
    $icon = if ($ok) { "PASS" } else { "FAIL" }
    $color = if ($ok) { "Green" } else { "Red" }
    Write-Host "  [$icon] $name$(if($detail){ ': ' + $detail })" -ForegroundColor $color
    $script:results += @{ name=$name; ok=$ok }
}

function GET($url, $tok=$null) {
    $cl = New-Object System.Net.Http.HttpClient
    if ($tok) { $cl.DefaultRequestHeaders.Add("Authorization","Bearer $tok") }
    $t = $cl.GetAsync($url); $t.Wait(8000) | Out-Null
    $r = $t.Result.Content.ReadAsStringAsync(); $r.Wait() | Out-Null
    $code = [int]$t.Result.StatusCode; $cl.Dispose()
    return @{ code=$code; body=$r.Result }
}

function POST($url, $json, $tok=$null) {
    $cl = New-Object System.Net.Http.HttpClient
    if ($tok) { $cl.DefaultRequestHeaders.Add("Authorization","Bearer $tok") }
    $cnt = New-Object System.Net.Http.StringContent($json,[System.Text.Encoding]::UTF8,"application/json")
    $t = $cl.PostAsync($url,$cnt); $t.Wait(8000) | Out-Null
    $r = $t.Result.Content.ReadAsStringAsync(); $r.Wait() | Out-Null
    $code = [int]$t.Result.StatusCode; $cl.Dispose()
    return @{ code=$code; body=$r.Result }
}

function PUT($url, $json, $tok) {
    $cl = New-Object System.Net.Http.HttpClient
    if ($tok) { $cl.DefaultRequestHeaders.Add("Authorization","Bearer $tok") }
    $cnt = New-Object System.Net.Http.StringContent($json,[System.Text.Encoding]::UTF8,"application/json")
    $t = $cl.PutAsync($url,$cnt); $t.Wait(8000) | Out-Null
    $r = $t.Result.Content.ReadAsStringAsync(); $r.Wait() | Out-Null
    $code = [int]$t.Result.StatusCode; $cl.Dispose()
    return @{ code=$code; body=$r.Result }
}

function PATCH($url, $json, $tok) {
    $cl = New-Object System.Net.Http.HttpClient
    if ($tok) { $cl.DefaultRequestHeaders.Add("Authorization","Bearer $tok") }
    $req = New-Object System.Net.Http.HttpRequestMessage("PATCH",$url)
    $req.Content = New-Object System.Net.Http.StringContent($json,[System.Text.Encoding]::UTF8,"application/json")
    $t = $cl.SendAsync($req); $t.Wait(8000) | Out-Null
    $r = $t.Result.Content.ReadAsStringAsync(); $r.Wait() | Out-Null
    $code = [int]$t.Result.StatusCode; $cl.Dispose()
    return @{ code=$code; body=$r.Result }
}

function DELETE($url, $tok) {
    $cl = New-Object System.Net.Http.HttpClient
    if ($tok) { $cl.DefaultRequestHeaders.Add("Authorization","Bearer $tok") }
    $t = $cl.DeleteAsync($url); $t.Wait(8000) | Out-Null
    $r = $t.Result.Content.ReadAsStringAsync(); $r.Wait() | Out-Null
    $code = [int]$t.Result.StatusCode; $cl.Dispose()
    return @{ code=$code; body=$r.Result }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SHOPZEE API TEST SUITE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# ── AUTH ─────────────────────────────────────────────
Write-Host "`n[ AUTH ]" -ForegroundColor Yellow

$aR = POST "$base/auth/login" '{"email":"admin@shopzee.pk","password":"Admin@2026"}'
$aObj = $aR.body | ConvertFrom-Json
$aT = $aObj.token
Test "Admin login" ($aR.code -eq 200 -and $aObj.user.role -eq "admin") "role=$($aObj.user.role)"

$uR = POST "$base/auth/login" '{"email":"test_1787326045@test.com","password":"Test@123"}'
$uObj = $uR.body | ConvertFrom-Json
$uT = $uObj.token
Test "User login" ($uR.code -eq 200) "name=$($uObj.user.name)"

$wR = POST "$base/auth/login" '{"email":"test_1787326045@test.com","password":"BadPass"}'
Test "Wrong password rejected" ($wR.code -eq 401) "HTTP $($wR.code)"

$meR = GET "$base/auth/me" $uT
$meObj = $meR.body | ConvertFrom-Json
Test "GET /auth/me" ($meR.code -eq 200) "user=$($meObj.name)"

$fpR = POST "$base/auth/forgot-password" '{"email":"test_1787326045@test.com"}'
Test "Forgot password" ($fpR.code -eq 200) ($fpR.body | ConvertFrom-Json).message

$rpR = POST "$base/auth/reset-password" '{"token":"000000","newPassword":"X"}'
Test "Invalid OTP rejected" ($rpR.code -eq 400) "HTTP $($rpR.code)"

$cpR = PUT "$base/auth/change-password" '{"currentPassword":"Test@123","newPassword":"Test@456"}' $uT
Test "Change password" ($cpR.code -eq 200) ($cpR.body | ConvertFrom-Json).message
# Change back
PUT "$base/auth/change-password" '{"currentPassword":"Test@456","newPassword":"Test@123"}' $uT | Out-Null

$puR = PUT "$base/auth/profile" '{"name":"Test User","phone":"03001234567"}' $uT
Test "Update profile" ($puR.code -eq 200) ($puR.body | ConvertFrom-Json).name

# ── PRODUCTS ─────────────────────────────────────────
Write-Host "`n[ PRODUCTS ]" -ForegroundColor Yellow

$prR = GET "$base/products?pageSize=5"
$prObj = $prR.body | ConvertFrom-Json
Test "Products list" ($prR.code -eq 200 -and $prObj.totalCount -gt 0) "$($prObj.totalCount) products"

$p1R = GET "$base/products/1"
$p1Obj = $p1R.body | ConvertFrom-Json
Test "Product by ID + isInStock field" ($p1R.code -eq 200 -and $null -ne $p1Obj.isInStock) "$($p1Obj.name) isInStock=$($p1Obj.isInStock)"

$psR = GET "$base/products?search=embroidered"
$psObj = $psR.body | ConvertFrom-Json
Test "Product search" ($psObj.totalCount -gt 0) "$($psObj.totalCount) results for 'embroidered'"

$pfR = GET "$base/products?category=women&sortBy=price-asc"
$pfObj = $pfR.body | ConvertFrom-Json
Test "Product filter+sort" ($pfObj.totalCount -gt 0) "$($pfObj.totalCount) women's, first=PKR $($pfObj.items[0].price)"

$ftR = GET "$base/products/featured"
$ftArr = $ftR.body | ConvertFrom-Json
Test "Featured products" ($ftR.code -eq 200) "$($ftArr.Count) featured"

$rlR = GET "$base/products/1/related"
$rlArr = $rlR.body | ConvertFrom-Json
Test "Related products" ($rlR.code -eq 200) "$($rlArr.Count) related"

$catR = GET "$base/products/categories"
$catArr = $catR.body | ConvertFrom-Json
Test "Categories" ($catArr.Count -gt 0) "$($catArr.Count) categories: $($catArr.name -join ', ')"

# Admin: Create product
$npR = POST "$base/products" '{"name":"Test Product XYZ","description":"Test","price":5000,"categoryId":1,"subCategory":"Formal","sku":"TST-XYZ","stock":5,"sizes":["S","M"],"colors":[],"images":[],"tags":[],"isNew":false,"isFeatured":false}' $aT
$npObj = $npR.body | ConvertFrom-Json
Test "Admin create product" ($npR.code -in @(200,201)) "id=$($npObj.id) name=$($npObj.name)"

# Admin: Update product
$upR = PUT "$base/products/$($npObj.id)" '{"name":"Test Updated","description":"Updated","price":6000,"categoryId":1,"subCategory":"Casual","sku":"TST-XYZ","stock":10,"sizes":["S","M","L"],"colors":[],"images":[],"tags":[],"isNew":false,"isFeatured":false,"isActive":true,"isInStock":true}' $aT
$upObj = $upR.body | ConvertFrom-Json
Test "Admin update product" ($upR.code -eq 200) "name=$($upObj.name) price=$($upObj.price) isInStock=$($upObj.isInStock)"

# Stock toggle
$stR = PATCH "$base/products/$($npObj.id)/stock-toggle" '{}' $aT
$stObj = $stR.body | ConvertFrom-Json
Test "Stock toggle OFF" ($stR.code -eq 200 -and $stObj.isInStock -eq $false) "isInStock=False"
$st2R = PATCH "$base/products/$($npObj.id)/stock-toggle" '{}' $aT
$st2Obj = $st2R.body | ConvertFrom-Json
Test "Stock toggle ON" ($st2R.code -eq 200 -and $st2Obj.isInStock -eq $true) "isInStock=True"

# Admin: Delete product
$delR = DELETE "$base/products/$($npObj.id)" $aT
Test "Admin delete product" ($delR.code -eq 204) "HTTP 204 (soft delete)"
$chkR = GET "$base/products/$($npObj.id)"
Test "Deleted product hidden" ($chkR.code -eq 404) "HTTP 404 after delete"

# ── CART ─────────────────────────────────────────────
Write-Host "`n[ CART ]" -ForegroundColor Yellow

$cgR = GET "$base/cart" $uT
$cgObj = $cgR.body | ConvertFrom-Json
Test "Get cart" ($cgR.code -eq 200) "items=$($cgObj.itemCount)"

$caR = POST "$base/cart/items" '{"productId":3,"quantity":2,"selectedSize":"M","selectedColor":""}' $uT
$caObj = $caR.body | ConvertFrom-Json
Test "Add to cart" ($caR.code -in @(200,201)) "itemCount=$($caObj.itemCount)"

# ── WISHLIST ─────────────────────────────────────────
Write-Host "`n[ WISHLIST ]" -ForegroundColor Yellow

$wlR = POST "$base/wishlist/2" '{}' $uT
$wlObj = $wlR.body | ConvertFrom-Json
Test "Wishlist toggle add" ($wlR.code -eq 200) "wishlisted=$($wlObj.wishlisted)"
$wlR2 = POST "$base/wishlist/2" '{}' $uT
$wl2Obj = $wlR2.body | ConvertFrom-Json
Test "Wishlist toggle remove" ($wlR2.code -eq 200) "wishlisted=$($wl2Obj.wishlisted)"
$wlGetR = GET "$base/wishlist" $uT
$wlArr = $wlGetR.body | ConvertFrom-Json
Test "Get wishlist" ($wlGetR.code -eq 200) "$($wlArr.Count) items"

# ── ORDERS ───────────────────────────────────────────
Write-Host "`n[ ORDERS ]" -ForegroundColor Yellow

$ordR = POST "$base/orders" '{"firstName":"Test","lastName":"User","email":"test@test.com","phone":"03001234567","address1":"123 St","city":"Lahore","state":"Punjab","paymentMethod":"cod","items":[{"productId":4,"quantity":1,"selectedSize":"M","selectedColor":""}]}' $uT
$ordObj = $ordR.body | ConvertFrom-Json
Test "Place order" ($ordR.code -in @(200,201)) "#$($ordObj.orderNumber) PKR $($ordObj.total)"

$myR = GET "$base/orders" $uT
$myArr = $myR.body | ConvertFrom-Json
Test "My orders" ($myR.code -eq 200) "$($myArr.Count) orders"

$allR = GET "$base/orders/admin/all" $aT
$allObj = $allR.body | ConvertFrom-Json
Test "Admin all orders" ($allR.code -eq 200) "$($allObj.totalCount) total"

if ($ordObj.id) {
    $stOrdR = PUT "$base/orders/admin/$($ordObj.id)/status" '{"status":"shipped","trackingNumber":"TRK99999"}' $aT
    $stOrdObj = $stOrdR.body | ConvertFrom-Json
    Test "Update order status" ($stOrdR.code -eq 200) "status=$($stOrdObj.status) tracking=$($stOrdObj.trackingNumber)"
}

# ── ADMIN ────────────────────────────────────────────
Write-Host "`n[ ADMIN ]" -ForegroundColor Yellow

$dashR = GET "$base/admin/dashboard" $aT
$dashObj = $dashR.body | ConvertFrom-Json
Test "Dashboard" ($dashR.code -eq 200) "orders=$($dashObj.totalOrders) revenue=PKR $($dashObj.totalRevenue) products=$($dashObj.totalProducts) users=$($dashObj.totalUsers)"

$anaR = GET "$base/admin/analytics" $aT
Test "Analytics" ($anaR.code -eq 200) "HTTP 200"

$cusR = GET "$base/admin/customers" $aT
$cusArr = $cusR.body | ConvertFrom-Json
Test "Customers list" ($cusR.code -eq 200) "$($cusArr.Count) customers"

# ── SECURITY ─────────────────────────────────────────
Write-Host "`n[ SECURITY ]" -ForegroundColor Yellow

$sec1 = GET "$base/admin/dashboard"
Test "Unauthenticated admin blocked" ($sec1.code -eq 401) "HTTP $($sec1.code)"

$sec2 = GET "$base/orders/admin/all" $uT
Test "Customer cant access admin orders" ($sec2.code -in @(401,403)) "HTTP $($sec2.code)"

$sec3 = POST "$base/products" '{"name":"hack","description":"","price":0,"categoryId":1,"subCategory":"","sku":"","stock":0,"sizes":[],"colors":[],"images":[],"tags":[],"isNew":false,"isFeatured":false}' $uT
Test "Customer cant create product" ($sec3.code -in @(401,403)) "HTTP $($sec3.code)"

$sec4 = GET "$base/cart" $null
Test "Cart needs auth" ($sec4.code -eq 401) "HTTP $($sec4.code)"

# ── SUMMARY ──────────────────────────────────────────
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   RESULTS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
$passed = ($script:results | Where-Object { $_.ok }).Count
$failed = ($script:results | Where-Object { !$_.ok }).Count
Write-Host "  PASSED : $passed" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "  FAILED : $failed" -ForegroundColor Red
    Write-Host "`n  Failed tests:" -ForegroundColor Red
    $script:results | Where-Object { !$_.ok } | ForEach-Object { Write-Host "    - $($_.name)" -ForegroundColor Red }
}
Write-Host "  TOTAL  : $($passed + $failed)" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan
