import React from 'react';

const SEOContent = () => {
  return (
    <>
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