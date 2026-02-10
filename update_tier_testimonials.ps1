$rootPath = "c:\Users\hp\Desktop\workspace\adminRole\frontend\sheildsupport\staffing-services"
$files = Get-ChildItem -Path $rootPath -Filter *-tier*.html

$testimonialTemplate = @"
    <!-- testimonial area start -->
    <div class="testimonial-area about-area-custom-bg pd-top-55 pd-bottom-90">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-6 col-md-10">
                    <div class="section-title text-center">
                        <h5 class="sub-title double-line">Client Feedback</h5>
                        <h2 class="title">What Our Clients Say</h2>
                        <p class="content">
                            See how we've helped businesses and individuals achieve their goals with our reliable IT support and
                            staffing solutions.
                        </p>
                    </div>
                </div>
            </div>
            <div class="testimonial-slider-2 style-active-bg slider-control-round owl-carousel">
                <div class="item">
                    <div class="single-testimonial-inner style-4">
                        <div class="details">
                            <p>
                                "Shield Support's dedicated team has been a game-changer for our IT infrastructure. We've seen a 40%
                                drop in downtime since we partnered with them."
                            </p>
                            <h4>Mark Richardson</h4>
                            <span class="designation">Small Business Owner</span>
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="single-testimonial-inner style-4">
                        <div class="details">
                            <p>
                                "The personal helpdesk is incredible. They fixed my Adobe Creative Cloud issues in minutes so I
                                could get back to work. Highly recommended!"
                            </p>
                            <h4>Sarah Jenkins</h4>
                            <span class="designation">Freelance Designer</span>
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="single-testimonial-inner style-4">
                        <div class="details">
                            <p>
                                "Their cyber security audit was thorough and professional. We feel much safer knowing Shield Support
                                is watching our back 24/7."
                            </p>
                            <h4>David Chen</h4>
                            <span class="designation">CTO at TechFlow</span>
                        </div>
                    </div>
                </div>
                <div class="item">
                    <div class="single-testimonial-inner style-4">
                        <div class="details">
                            <p>
                                "NOC staffing from Shield Support gave us the 24/7 coverage we needed without the overhead of hiring
                                internally. Seamless integration!"
                            </p>
                            <h4>Emily White</h4>
                            <span class="designation">Operations Manager</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- testimonial area end -->
"@

foreach ($file in $files) {
    # Calculate path prefix - always ../ for these since they are in staffing-services/
    $prefix = "../"
    
    # In this script, we don't need to replace {{PATH_PREFIX}} because there are no recursive root links in the template above,
    # but we'll include it just in case we add them later. 
    $thisTestimonial = $testimonialTemplate.Replace("{{PATH_PREFIX}}", $prefix)

    # Read content
    $content = Get-Content -Path $file.FullName -Raw

    # 1. Update existing testimonials if markers exist
    if ($content -match "(?s)<!-- testimonial area start -->.*?<!-- testimonial area end -->") {
        $newContent = $content -replace "(?s)<!-- testimonial area start -->.*?<!-- testimonial area end -->", $thisTestimonial
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        Write-Host "Updated existing testimonials in: $($file.Name)"
    }
    # 2. Otherwise insert before CTA BANNER
    elseif ($content -match "<!-- CTA BANNER -->") {
        $newContent = $content -replace "<!-- CTA BANNER -->", "$thisTestimonial`n`n    <!-- CTA BANNER -->"
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        Write-Host "Inserted testimonials before CTA in: $($file.Name)"
    }
    # 3. Otherwise insert before footer
    elseif ($content -match "<!-- footer area start -->") {
        $newContent = $content -replace "<!-- footer area start -->", "$thisTestimonial`n`n    <!-- footer area start -->"
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        Write-Host "Inserted testimonials before footer in: $($file.Name)"
    }
    else {
        Write-Warning "No suitable insertion point found in: $($file.Name)"
    }
}
