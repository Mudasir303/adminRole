$rootPath = "c:\Users\hp\Desktop\workspace\adminRole\frontend\sheildsupport"
$files = Get-ChildItem -Path $rootPath -Recurse -Filter *.html

$footerTemplate = @"
      <!-- footer area start -->
      <footer class="footer-area bg-black bg-cover" style="background-image: url('{{PATH_PREFIX}}assets/img/bg/2.png')">
        <div class="container">
          <div class="row">
            <!-- Column 1: About & Subscribe (Col-3) -->
            <div class="col-lg-3 col-md-6">
              <div class="widget widget_about">
                <a href="{{PATH_PREFIX}}index.html" class="footer-logo">
                  <img src="{{PATH_PREFIX}}assets/img/unnamed footer logo.webp" alt="Shield Support LLC" style="max-width: 180px; margin-bottom: 2rem;">
                </a>
                <div class="details">
                  <p>We are a leading provider of IT and support in the United States. We work with clients all over the world.</p>
                </div>
              </div>
              <div class="widget widget_subscribe mt-4">
                <h4 class="widget-title">Subscribe</h4>
                <div class="single-input-inner style-border style-bg-none">
                  <input type="text" placeholder="Your email address" />
                  <button><i class="fa fa-arrow-right"></i></button>
                </div>

              </div>
            </div>

            <!-- Column 2: Quick Links (Col-2) -->
            <div class="col-lg-2 col-md-4 col-sm-6">
              <div class="widget widget_nav_menu">
                <h4 class="widget-title">Quick Links</h4>
                <ul>
                  <li><a href="{{PATH_PREFIX}}index.html">Home</a></li>
                  <li><a href="{{PATH_PREFIX}}about.html">About Us</a></li>
                  <li><a href="{{PATH_PREFIX}}blog.html">Blog</a></li>
                  <li><a href="{{PATH_PREFIX}}resources.html">Resources</a></li>
                  <li><a href="{{PATH_PREFIX}}contact.html">Contact Us</a></li>
                  <li><a href="{{PATH_PREFIX}}privacy-policy.html">Privacy Policy</a></li>
                  <li><a href="{{PATH_PREFIX}}career.html">Career</a></li>
                </ul>
              </div>
            </div>

            <!-- Column 3: IT Services (Col-2) -->
            <div class="col-lg-2 col-md-4 col-sm-6">
              <div class="widget widget_nav_menu">
                <h4 class="widget-title">IT Services</h4>
                <ul>
                  <li><a href="{{PATH_PREFIX}}service-personal.html">Personal Help Desk</a></li>
                  <li><a href="{{PATH_PREFIX}}service-backend.html">Backend Support</a></li>
                  <li><a href="{{PATH_PREFIX}}service-cyber.html">Cyber Security</a></li>
                  <li><a href="{{PATH_PREFIX}}service-digital.html">Digital Marketing</a></li>
                  <li><a href="{{PATH_PREFIX}}service-development.html">Web & App Development</a></li>
                  <li><a href="{{PATH_PREFIX}}service-staffing.html">Staffing & Recruitment</a></li>
                </ul>
              </div>
            </div>

            <!-- Column 4: Staffing (Col-2) -->
            <div class="col-lg-2 col-md-4 col-sm-6">
              <div class="widget widget_nav_menu">
                <h4 class="widget-title">Staffing</h4>
                <ul>
                  <li><a href="{{PATH_PREFIX}}staffing-services/noc-staffing.html">NOC Staffing</a></li>
                  <li><a href="{{PATH_PREFIX}}staffing-services/cyber-security-staffing.html">Cyber Staffing</a></li>
                  <li><a href="{{PATH_PREFIX}}staffing-services/cloud-computing-staffing.html">Cloud Staffing</a></li>
                  <li><a href="{{PATH_PREFIX}}staffing-services/help-desk-staffing.html">Help Desk Staffing</a></li>
                </ul>
              </div>
            </div>
            
            <!-- Column 5: Get In Touch (Col-3) -->
            <div class="col-lg-3 col-md-6">
              <div class="widget widget_about">
                <h4 class="widget-title">Get In Touch</h4>
                <div class="details">
                  <p class="mt-2 text-white"><strong>USA Office</strong></p>
                  <p>2035 Sunset Lake Road, Suite B-2, Newark, DE, USA-19702</p>
                  
                  <p class="mt-2 text-white"><strong>Malaysian Office</strong></p>
                  <p>RR Gemini Services No-7 Jalan Kesum 24/37 seksyen, 24 Shah Alam Selangor, Malaysia-40300</p>
                  
                  <p class="mt-2 mb-0 text-white"><strong>Follow Us</strong></p>
                  <ul class="social-media" style="margin-top: 0; padding-left: 0;">
                    <li><a class="linkedin" href="https://www.linkedin.com/company/shieldsupport/posts/?feedView=all" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bottom text-center">
          <div class="container">
            <div class="row">
              <div class="col-md-12 align-self-center">
                <p>&copy; 2025 Shield Support LLC. All Rights Reserved</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <!-- footer area end -->
"@

foreach ($file in $files) {
  # Calculate path prefix
  $relPath = $file.FullName.Substring($rootPath.Length + 1)
  $depth = ($relPath.Split('\').Count) - 1
  $prefix = ""
  if ($depth -gt 0) {
    $prefix = "../" * $depth
  }

  # Prepare footer content for this file
  $thisFooter = $footerTemplate.Replace("{{PATH_PREFIX}}", $prefix)

  # Read content
  $content = Get-Content -Path $file.FullName -Raw

  # Replace footer
  # Using regex to find block, handling potential whitespace variations if needed, but standard should be exact
  # We use (?s) for single-line mode (dot matches newline)
  if ($content -match "(?s)<!-- footer area start -->.*?<!-- footer area end -->") {
    $newContent = $content -replace "(?s)<!-- footer area start -->.*?<!-- footer area end -->", $thisFooter
    Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
    Write-Host "Updated: $($file.Name) (Prefix: '$prefix')"
  }
  else {
    Write-Warning "Footer markers not found in: $($file.Name)"
  }
}
