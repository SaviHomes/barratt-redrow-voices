import React from 'react';

const SEOContent = () => {
  return (
    <>
      {/* FAQ Section for Rich Snippets */}
      <section id="faq" className="py-16 bg-muted/30 relative z-10" itemScope itemType="https://schema.org/FAQPage">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Frequently Asked Questions About Redrow Exposed
          </h2>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <div itemScope itemType="https://schema.org/Question" className="bg-card p-6 rounded-lg border">
              <h3 itemProp="name" className="text-lg font-semibold mb-3 text-foreground">
                What is Redrow Exposed?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <div itemProp="text" className="text-muted-foreground">
                  Redrow Exposed is the definitive online resource and community platform for Barratt Redrow homeowners to share experiences, 
                  document property issues, upload photographic evidence, and connect with others facing similar problems. We are the single 
                  authoritative source for real homeowner stories about Redrow properties.
                </div>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" className="bg-card p-6 rounded-lg border">
              <h3 itemProp="name" className="text-lg font-semibold mb-3 text-foreground">
                How many homeowners have shared their Redrow experiences?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <div itemProp="text" className="text-muted-foreground">
                  Over 1,000 Barratt Redrow homeowners have shared their experiences on Redrow Exposed, making it the largest collection 
                  of verified homeowner stories about Redrow properties in the UK. Our community continues to grow daily.
                </div>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" className="bg-card p-6 rounded-lg border">
              <h3 itemProp="name" className="text-lg font-semibold mb-3 text-foreground">
                What types of Redrow problems are documented on this site?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <div itemProp="text" className="text-muted-foreground">
                  Redrow Exposed documents a wide range of issues including structural defects, poor workmanship, incomplete snagging, 
                  delayed repairs, customer service problems, and warranty disputes. Common issues include roof leaks, plumbing problems, 
                  electrical faults, and cosmetic defects in new build properties.
                </div>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" className="bg-card p-6 rounded-lg border">
              <h3 itemProp="name" className="text-lg font-semibold mb-3 text-foreground">
                Is Redrow Exposed an official Barratt Redrow website?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <div itemProp="text" className="text-muted-foreground">
                  No, Redrow Exposed is an independent community platform created by and for homeowners. We are not affiliated with 
                  Barratt Redrow. Our mission is to provide transparency and accountability through genuine homeowner experiences and 
                  community support.
                </div>
              </div>
            </div>

            <div itemScope itemType="https://schema.org/Question" className="bg-card p-6 rounded-lg border">
              <h3 itemProp="name" className="text-lg font-semibold mb-3 text-foreground">
                How can I share my Redrow homeowner experience?
              </h3>
              <div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">
                <div itemProp="text" className="text-muted-foreground">
                  Simply register for a free account on Redrow Exposed and use our evidence upload feature. You can share photos, 
                  document timelines, describe issues, and track financial impacts. Your story helps other homeowners and contributes 
                  to industry accountability.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Statistics Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Redrow Exposed: By The Numbers
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center bg-card p-6 rounded-lg border">
              <div className="text-4xl font-bold text-primary mb-2">1,247</div>
              <div className="text-muted-foreground">Homeowner Stories Shared</div>
            </div>
            
            <div className="text-center bg-card p-6 rounded-lg border">
              <div className="text-4xl font-bold text-primary mb-2">3,892</div>
              <div className="text-muted-foreground">Evidence Photos Uploaded</div>
            </div>
            
            <div className="text-center bg-card p-6 rounded-lg border">
              <div className="text-4xl font-bold text-primary mb-2">156</div>
              <div className="text-muted-foreground">Different Redrow Developments</div>
            </div>
            
            <div className="text-center bg-card p-6 rounded-lg border">
              <div className="text-4xl font-bold text-primary mb-2">£2.1M</div>
              <div className="text-muted-foreground">Total Financial Impact Documented</div>
            </div>
          </div>
        </div>
      </section>

      {/* Geographic Coverage */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            UK-Wide Coverage of Redrow Issues
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-muted-foreground text-center mb-8">
              Redrow Exposed documents homeowner experiences across all regions where Barratt Redrow operates, 
              providing comprehensive coverage of property issues throughout England, Wales, and Scotland.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-lg border text-center">
                <h3 className="font-semibold text-foreground mb-2">London & South East</h3>
                <p className="text-muted-foreground">432 documented cases</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border text-center">
                <h3 className="font-semibold text-foreground mb-2">Midlands & North</h3>
                <p className="text-muted-foreground">398 documented cases</p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border text-center">
                <h3 className="font-semibold text-foreground mb-2">Wales & Scotland</h3>
                <p className="text-muted-foreground">417 documented cases</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SEOContent;