import { ArrowRight, Banknote, Globe2, Layers, Printer, Smartphone, Truck, Users } from 'lucide-react';
import CutSlider from '@/components/CutSlider';
import Editor from '@/components/Editor';
import FeatureTabs from '@/components/FeatureTabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { T, TH } from '@/i18n/LangProvider';
import { asset } from '@/lib/asset';

const APP = 'https://designs.ifiok.ng/editor';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="top">
        {/* hero */}
        <div className="hero">
          <div className="wrap">
            <div>
              <TH as="h1" k="hero.h1">{'Design for print, <u>not just for screens</u>.'}</TH>
              <p className="lead"><T k="hero.lead">Make it here, then send it to a verified printer near you. Real print sizes, bleed and 300 DPI are checked while you work, and you see each printer’s price before you order.</T></p>
              <div className="herocta">
                <a className="btn btn-gold" href={APP}><T k="cta.startFree">Start designing — free</T></a>
                <a className="btn btn-line" href="#templates"><T k="cta.browse">Browse 530+ templates</T></a>
              </div>
              <p className="trust">
                <span><b>530+</b> <T k="trust.tpl">free templates</T></span>
                <span><b>300 DPI · CMYK</b> <T k="trust.print">print-ready</T></span>
                <span><b><T k="trust.ngB">Naira</T></b> <T k="trust.ng">checkout, delivered nationwide</T></span>
              </p>
            </div>
            <Editor />
          </div>
        </div>

        {/* what will you make */}
        <section className="alt" id="make">
          <div className="wrap">
            <div className="sechead center">
              <span className="kick">What will you make today?</span>
              <h2>One place for the design, the document and the print.</h2>
            </div>
            <FeatureTabs />
          </div>
        </section>

        {/* print pipeline */}
        <section id="print">
          <div className="wrap">
            <div className="two wide-r">
              <div>
                <span className="kick"><T k="print.kick">The difference</T></span>
                <h2><T k="print.h2">Canva stops at Download. We keep going.</T></h2>
                <p className="lead"><T k="print.lead">Every page you open is a real print job: measured in inches, set to 300 DPI and CMYK, with bleed on all four edges. The bar at the bottom of the editor is doing the work a printer would otherwise do for you — and charge you for.</T></p>
              </div>
              <div className="shot">
                <img src={asset('/img/editor-desktop.png')} alt="The Ifiok Design editor with a 24 by 36 inch page open, showing 300 DPI and CMYK in the status bar and an Order Print button" width={1919} height={878} loading="lazy" />
              </div>
            </div>
            <div className="pipe">
              <div><span className="n">01</span><h3><T k="pipe.1h">Design at real size</T></h3><p><T k="pipe.1p">Pick a format and the page is built in inches, not pixels. Bleed and safe area are on the page from the first second.</T></p></div>
              <div><span className="n">02</span><h3><T k="pipe.2h">See the price while you work</T></h3><p><T k="pipe.2p">The status bar carries the dimensions, resolution, colour mode and the estimated price for your quantity.</T></p></div>
              <div><span className="n">03</span><h3><T k="pipe.3h">Order without leaving</T></h3><p><T k="pipe.3p">Order Print is in the top bar. Choose paper and finish, pay in naira by transfer or card.</T></p></div>
              <div><span className="n">04</span><h3><T k="pipe.4h">A real printer makes it</T></h3><p><T k="pipe.4p">A verified print shop takes the job and it is delivered nationwide. Chat with the team about the order, voice notes included.</T></p></div>
            </div>
          </div>
        </section>

        {/* templates */}
        <section className="alt" id="templates">
          <div className="wrap">
            <div className="two wide-l">
              <div className="shot">
                <img src={asset('/img/templates.png')} alt="The Ifiok Designs templates page listing free editable templates by category" width={1892} height={886} loading="lazy" />
              </div>
              <div>
                <span className="kick"><T k="tpl.kick">Templates</T></span>
                <h2><T k="tpl.h2">530+ templates, free, and built at print size.</T></h2>
                <p className="lead"><T k="tpl.lead">Flyers, business cards, forms, ID cards, letterheads, brand kits and charts — made with real photos, not placeholder boxes. Open one, change the words, order the print.</T></p>
                <div className="herocta"><a className="btn btn-teal" href="https://designs.ifiok.ng/templates"><T k="tpl.cta">See all templates</T></a></div>
              </div>
            </div>

            <div className="mosaic" aria-label="Example layouts for everyday Nigerian and African occasions">
              <div className="mt mt-church m-a"><small>CHURCH PROGRAMME</small><strong>Thanksgiving Service</strong><span>Sunday 9am · Redeemed Hall, Surulere</span></div>
              <div className="mt mt-owambe m-b"><small>INVITATION</small><strong>Ade &amp; Funmi</strong><span>Traditional wedding · Saturday · Asọ-ẹbí: gold and wine</span></div>
              <div className="mt mt-sale m-c"><small>FLEX BANNER</small><strong>MEGA SALE</strong><span>Up to 40% off · Balogun Market</span></div>
              <div className="mt mt-id m-n"><span className="av" /><strong>Chidi Eze</strong><span>Staff · EZE-0127</span></div>
              <div className="mt mt-receipt m-n"><small>RECEIPT BOOK</small><strong>Mama Tolu Stores</strong><span>No. 0001 · Date ____ · Total ₦ ____</span></div>
              <div className="mt mt-naming m-n"><small>NAMING CEREMONY</small><strong>Welcome, Oluwaseun</strong><span>Eighth day · Lagos</span></div>
              <div className="mt mt-grad m-w"><small>CONVOCATION</small><strong>Class of 2026</strong><span>University of Ibadan · Faculty of Arts</span></div>
              <div className="mt mt-card m-n"><small>BUSINESS CARD</small><strong>Kemi Adebayo</strong><span>Tailor · Kano</span></div>
            </div>
            <p className="mt-note">Example layouts. Open any template in the editor and swap in your own words, photos and colours.</p>
          </div>
        </section>

        {/* all in one place */}
        <section id="suite">
          <div className="wrap">
            <div className="sechead center">
              <h2>All the tools. All in one place.</h2>
            </div>
            <div className="suite">
              <div className="gcard g-teal">
                <h3>Design, price and print in a single flow</h3>
                <p>Open a template, watch the naira price move, and order delivery to your state without leaving the editor.</p>
                <a className="btn" href={APP}>Open the editor <ArrowRight aria-hidden="true" /></a>
                <div className="orbit" aria-hidden="true">
                  <span><Layers /></span><span><Printer /></span><span><Banknote /></span><span><Truck /></span><span><Smartphone /></span>
                </div>
              </div>
              <div className="gcard g-gold">
                <h3>Students get paid for the templates they make</h3>
                <p>The Campus Creator Program pays you once your design is approved, straight to your bank account.</p>
                <a className="btn" href="https://ifiok.ng/design/creators">Become a creator <ArrowRight aria-hidden="true" /></a>
                <div className="orbit" aria-hidden="true">
                  <span><Users /></span><span><Banknote /></span><span><Globe2 /></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* features */}
        <section className="alt" id="features">
          <div className="wrap">
            <div className="two wide-r">
              <div>
                <span className="kick"><T k="feat.kick">Live now</T></span>
                <h2><T k="feat.h2">Remove a background in one tap.</T></h2>
                <p className="lead"><T k="feat.lead">Shoot your product on any table, drop it in, and the background goes. It runs on the live site today. Drag the handle to see it.</T></p>
              </div>
              <CutSlider />
            </div>

            <div className="feats">
              <div><b><T k="f.ai">Design with AI</T></b><span><T k="f.aid">Describe a flyer and get a layout you can edit, not a flat picture.</T></span></div>
              <div><b><T k="f.brand">Brand kit</T></b><span><T k="f.brandd">Logos, business cards, letterheads and multi-page brand guides that share your colours and fonts.</T></span></div>
              <div><b><T k="f.imp">Open PDF and PowerPoint</T></b><span><T k="f.impd">Import a PDF or a .pptx deck and keep editing. Text stays text. Export back to PowerPoint.</T></span></div>
              <div><b><T k="f.bulk">Bulk ID cards</T></b><span><T k="f.bulkd">Upload a sheet of names and photos, get one card per person, ready to print.</T></span></div>
              <div><b><T k="f.fx">Effects and borders</T></b><span><T k="f.fxd">Shadow, glow, blur, soft edge and reflection, plus page borders you can recolour.</T></span></div>
              <div><b><T k="f.data">Data Studio, charts and graphs</T></b><span><T k="f.datad">Data charts and maths function graphs you can drop straight into a design.</T></span></div>
              <div><b><T k="f.qr">QR codes and Link in Bio</T></b><span><T k="f.qrd">Trackable QR codes, short links and a link page, with scan and click analytics.</T></span></div>
              <div><b><T k="f.docs">Document and PDF editor</T></b><span><T k="f.docsd">Letters, CVs and forms, plus signing and filling PDFs in the same account.</T></span></div>
              <div><b><T k="f.student">Free for students</T></b><span><T k="f.studentd">Verify once with your school ID and unlock student perks.</T></span></div>
              <div><b><T k="f.mobile">Built for a small phone first</T></b><span><T k="f.mobiled">The editor is designed at 375px wide before it is scaled up to a desktop.</T></span></div>
              <div><b><T k="f.collab">Live collaboration</T> <span className="badge soon"><T k="badge.soon">soon</T></span></b><span><T k="f.collabd">Edit the same design with someone else, in real time.</T></span></div>
              <div><b><T k="f.bid">Printer bidding</T> <span className="badge soon"><T k="badge.soon">soon</T></span></b><span><T k="f.bidd">Print shops compete for your job so you pick the price you like.</T></span></div>
            </div>
          </div>
        </section>

        {/* mobile app */}
        <section id="app">
          <div className="wrap">
            <div className="two">
              <div>
                <span className="kick"><T k="app.kick">Mobile app</T></span>
                <h2><T k="app.h2">The files people send you, open on your phone.</T></h2>
                <p className="lead"><T k="app.lead">The same editor, built for the phone in your hand — and it opens the formats that usually need a laptop and a licence.</T></p>
                <div className="ftypes">
                  <div><span className="ext">PPTX</span><b>PowerPoint<small><T k="app.ppt">Open and edit decks</T></small></b><em className="y"><T k="badge.edit">open + edit</T></em></div>
                  <div><span className="ext">PDF</span><b>PDF<small><T k="app.pdf">Edit text, photos and pages</T></small></b><em className="y"><T k="badge.edit">open + edit</T></em></div>
                  <div><span className="ext">CDR</span><b>CorelDRAW<small><T k="app.cdr">View .cdr without CorelDRAW</T></small></b><em className="v"><T k="badge.view">view</T></em></div>
                  <div><span className="ext">PSD</span><b>Photoshop<small><T k="app.psd">Open layered .psd files</T></small></b><em className="s"><T k="badge.soon">soon</T></em></div>
                  <div><span className="ext">+</span><b><T k="app.more">More design formats</T><small><T k="app.mored">AI, EPS and others on the way</T></small></b><em className="s"><T k="badge.soon">soon</T></em></div>
                </div>
                <p className="banner"><b><T k="app.freeB">Free for everyone until December 2027.</T></b> <T k="app.free">No subscription, no trial, no card.</T></p>
                <div className="herocta"><a className="btn btn-gold" href="https://ifiok.ng/get-app"><T k="app.cta">Get the app</T></a></div>
              </div>
              <div>
                <div className="phone">
                  <img src={asset('/img/editor-mobile.png')} alt="The Ifiok Design editor on a phone, with the tool bar along the bottom" width={367} height={758} loading="lazy" />
                </div>
                <p className="shotcap" style={{ textAlign: 'center' }}><T k="app.cap">The editor on a phone — same page, same print specs.</T></p>
              </div>
            </div>
          </div>
        </section>

        {/* free tools */}
        <section className="alt" id="tools">
          <div className="wrap">
            <div className="sechead">
              <span className="kick"><T k="tools.kick">Ifiok Tools</T></span>
              <h2><T k="tools.h2">The small jobs, free, in your browser.</T></h2>
              <p><T k="tools.lead">No account needed for most of them, nothing to install, and your file never has to leave your phone.</T></p>
            </div>
            <div className="tools">
              {[
                ['Merge PDF', 'PDF', 'merge-pdf'], ['Split PDF', 'PDF', 'split-pdf'], ['Compress PDF', 'PDF', 'compress-pdf'], ['PDF to Word', 'PDF', 'pdf-to-word'], ['Scan to PDF', 'PDF', 'scan-to-pdf'],
                ['Sign PDF', 'PDF', ''], ['Fill a form', 'PDF', ''], ['Protect PDF', 'PDF', ''], ['Unlock PDF', 'PDF', ''], ['Confidential mode', 'PDF', ''],
                ['QR generator', 'Marketing', 'qr-code-generator'], ['Trackable QR', 'Marketing', 'my-qr-codes'], ['Link shortener', 'Marketing', 'link-shortener'], ['Link in Bio', 'Marketing', 'link-in-bio'], ['Scan analytics', 'Marketing', ''],
              ].map(([name, cat, slug]) => (
                <a key={name} href={`https://ifiok.ng/tools${slug ? `/${slug}` : ''}`}>{name}<i>{cat}</i></a>
              ))}
            </div>
          </div>
        </section>

        {/* creators */}
        <section id="creators">
          <div className="wrap">
            <div className="sechead">
              <span className="kick"><T k="cre.kick">Campus Creator Program</T></span>
              <h2><T k="cre.h2">Get paid for what you design.</T></h2>
              <p><T k="cre.lead">Students make templates for Ifiok. If we approve your design, we pay you for it — one payment, straight to your bank account. No waiting to see if it sells.</T></p>
            </div>
            <div className="flow">
              <b><T k="cre.s1">Sign up</T></b><ArrowRight aria-hidden="true" />
              <b><T k="cre.s2">Design a template</T></b><ArrowRight aria-hidden="true" />
              <b><T k="cre.s3">Submit for review</T></b><ArrowRight aria-hidden="true" />
              <b><T k="cre.s4">Approved</T></b><ArrowRight aria-hidden="true" />
              <b><T k="cre.s5">Paid in naira</T></b>
            </div>
            <div className="cre">
              <div><h3><T k="cre.who">Who it is for</T></h3><p><T k="cre.whod">Students in Nigerian schools who can design — graphics, architecture, art, business, anyone with an eye for a layout. You do not need a laptop or costly software, because the editor works on a phone.</T></p></div>
              <div><h3><T k="cre.get">What you get</T></h3><p><T k="cre.getd">Money for your work, a public creator page with your own link to show clients and employers, and real portfolio pieces used by real businesses across the country.</T></p></div>
              <div><h3><T k="cre.reach">Nigeria now, Africa next</T></h3><p><T k="cre.reachd">The program is open to students in Nigeria today, and printing is delivered to every state, so your templates reach businesses nationwide. More African countries follow as we open payouts in each local currency.</T></p></div>
            </div>
            <div className="herocta">
              <a className="btn btn-gold" href="https://ifiok.ng/design/creators"><T k="cre.cta">Register as a creator</T></a>
              <a className="btn btn-line" href="https://ifiok.ng/design/creators"><T k="cre.cta2">ifiok.ng/design/creators</T></a>
            </div>
          </div>
        </section>

        <div className="end">
          <div className="wrap">
            <h2><T k="end.h2">Open the editor. Make one thing.</T></h2>
            <p><T k="end.p">It costs nothing to try, and you will know inside two minutes whether it beats what you use now.</T></p>
            <div className="herocta">
              <a className="btn btn-gold" href={APP}><T k="cta.startFree">Start designing — free</T></a>
              <a className="btn btn-line" href="https://ifiok.ng/get-app"><T k="app.cta">Get the app</T></a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
