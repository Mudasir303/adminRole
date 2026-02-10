$rootPath = "c:\Users\hp\Desktop\workspace\adminRole\frontend\sheildsupport"
$files = Get-ChildItem -Path $rootPath -Recurse -Filter *.html

$navbarTemplate = @"
  <!-- navbar start -->
  <div class="navbar-top">
    <div class="container">
      <div class="row">
        <div class="col-sm-6">
          <ul class="topbar-right text-md-start text-center">
            <li class="d-none d-lg-inline-block">
              <p>
                <i class="far fa-clock"></i> Opening Hour 10:00 am -05:00pm
              </p>
            </li>
            <li>
              <p>
                <i class="far fa-envelope"></i>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=care@shieldsupportllc.com">care@shieldsupportllc.com</a>
              </p>
            </li>

          </ul>
        </div>
        <div class="col-sm-6">
          <ul class="topbar-right text-md-end text-center">
            <li>
              <p>
                <i class="fas fa-briefcase"></i>
                <a href="{{PATH_PREFIX}}career.html">Career</a>
              </p>
            </li>
            <li class="d-none d-lg-inline-block">
              <p>Phone Number: <span><a href="tel:+17327027324">+1 (732) 702-7324</a></span></p>
            </li>
            <li class="social-area">

              <a href="https://www.linkedin.com/company/shieldsupport/posts/?feedView=all" target="_blank"><i
                  class="fab fa-linkedin-in" aria-hidden="true"></i></a>
              <a href="https://wa.me/17327027324" target="_blank"><i class="fab fa-whatsapp" aria-hidden="true"></i></a>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=care@shieldsupportllc.com"><i
                  class="far fa-envelope" aria-hidden="true"></i></a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <nav class="navbar navbar-area navbar-area-1 navbar-expand-lg">
    <div class="container nav-container navbar-bg">
      <div class="responsive-mobile-menu">
        <button class="menu toggle-btn d-block d-lg-none" data-target="#Iitechie_main_menu" aria-expanded="false"
          aria-label="Toggle navigation">
          <span class="icon-left"></span>
          <span class="icon-right"></span>
        </button>
      </div>
      <div class="logo">
        <a href="{{PATH_PREFIX}}index.html"><img src="{{PATH_PREFIX}}assets/img/SheildSupportLogo.png" alt="Shield Support LLC Logo" /></a>
      </div>
      <div class="nav-right-part nav-right-part-mobile">
        <!-- <a class="search-bar-btn" href="#">
          <i class="fa fa-search"></i>
        </a> -->
      </div>
      <div class="collapse navbar-collapse" id="Iitechie_main_menu">
        <ul class="navbar-nav menu-open text-lg-end">
          <li>
            <a href="{{PATH_PREFIX}}index.html">Home</a>
          </li>
          <li class="menu-item-has-children">
            <a href="{{PATH_PREFIX}}services.html">Services</a>
            <ul class="sub-menu">
              <li><a href="{{PATH_PREFIX}}service-personal.html">Personal Help Desk</a></li>
              <li><a href="{{PATH_PREFIX}}service-backend.html">Backend Support</a></li>
              <li><a href="{{PATH_PREFIX}}service-cyber.html">Cyber Security</a></li>
              <li><a href="{{PATH_PREFIX}}service-digital.html">Digital Marketing</a></li>
              <li><a href="{{PATH_PREFIX}}service-dedicated.html">Dedicated Resource Services</a></li>
              <li><a href="{{PATH_PREFIX}}service-brand.html">Brand Design & Strategy</a></li>
              <li><a href="{{PATH_PREFIX}}service-development.html">Web & App Development</a></li>
              <li><a href="{{PATH_PREFIX}}service-hosting.html">Hosting</a></li>
              <li><a href="{{PATH_PREFIX}}service-staffing.html">Staffing & Recruitment</a></li>
            </ul>

          </li>
          <li class="menu-item-has-children">
            <a href="{{PATH_PREFIX}}Staffing.html">Staffing</a>
            <ul class="sub-menu">
              <li><a href="{{PATH_PREFIX}}staffing-services/noc-staffing.html">NOC</a></li>
              <li><a href="{{PATH_PREFIX}}staffing-services/cyber-security-staffing.html">Cyber Security</a></li>
              <li><a href="{{PATH_PREFIX}}staffing-services/cloud-computing-staffing.html">Cloud Computing</a></li>
              <li><a href="{{PATH_PREFIX}}staffing-services/help-desk-staffing.html">Help Desk</a></li>
            </ul>
          </li>

          <li>
            <a href="{{PATH_PREFIX}}about.html">About Us</a>
          </li>
          
          <li>
            <a href="{{PATH_PREFIX}}blog.html">Blog</a>
          </li>
          <li><a href="{{PATH_PREFIX}}contact.html">Contact Us</a></li>
          <li><a href="{{PATH_PREFIX}}resources.html">Resources</a></li>

        </ul>
      </div>
      <div class="nav-right-part nav-right-part-desktop align-self-center">
        <a class="btn btn-base" href="{{PATH_PREFIX}}schedule.html">Schedule Meeting</a>
      </div>
    </div>
  </nav>
  <!-- navbar end -->
"@

foreach ($file in $files) {
    # Calculate path prefix
    $relPath = $file.FullName.Substring($rootPath.Length + 1)
    $depth = ($relPath.Split('\').Count) - 1
    $prefix = ""
    if ($depth -gt 0) {
        $prefix = "../" * $depth
    }

    # Prepare navbar content for this file
    $thisNavbar = $navbarTemplate.Replace("{{PATH_PREFIX}}", $prefix)

    # Read content
    $content = Get-Content -Path $file.FullName -Raw

    # Replace navbar
    if ($content -match "(?s)<!-- navbar start -->.*?<!-- navbar end -->") {
        $newContent = $content -replace "(?s)<!-- navbar start -->.*?<!-- navbar end -->", $thisNavbar
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        Write-Host "Updated: $($file.Name) (Prefix: '$prefix')"
    }
    else {
        Write-Warning "Navbar markers not found in: $($file.Name)"
    }
}
