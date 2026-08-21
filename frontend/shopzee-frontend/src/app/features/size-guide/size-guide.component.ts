import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-size-guide',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="sg-page">

      <!-- Hero -->
      <div class="sg-hero">
        <div class="container">
          <p class="sg-hero__label">Fit Guide</p>
          <h1 class="sg-hero__title">Size Guide</h1>
          <p class="sg-hero__sub">Find your perfect fit — all measurements in inches &amp; centimeters</p>
        </div>
      </div>

      <div class="container">
        <div class="sg-wrap">

          <!-- Sidebar -->
          <aside class="sg-toc">
            <div class="toc-card">
              <p class="toc-heading">Jump to</p>
              <nav>
                <a href="#how-to-measure">How to Measure</a>
                <a href="#women-suits">Women's Suits</a>
                <a href="#women-bottoms">Women's Bottoms</a>
                <a href="#men-kameez">Men's Kameez</a>
                <a href="#men-shalwar">Men's Shalwar</a>
                <a href="#tips">Fit Tips</a>
              </nav>
            </div>
            <div class="sg-contact-box">
              <p>Need help?</p>
              <a href="mailto:trendzyofficial.store@gmail.com">Email us your measurements</a>
            </div>
          </aside>

          <!-- Content -->
          <main class="sg-content">

            <div class="sg-intro">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <p>All STYLEMAKER garments are made in Pakistan and follow standard Pakistani sizing. If you are between sizes, we recommend sizing up. For custom tailoring, <a href="mailto:trendzyofficial.store@gmail.com">contact us</a> with your exact measurements.</p>
            </div>

            <!-- How to Measure -->
            <section id="how-to-measure">
              <div class="sg-section-label">Step 01</div>
              <h2>How to Measure Yourself</h2>
              <div class="measure-grid">
                <div class="measure-item">
                  <div class="measure-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.75" stroke-linecap="round"><circle cx="12" cy="5" r="3"/><path d="M12 8v4M8 12H5a2 2 0 00-2 2v4h18v-4a2 2 0 00-2-2h-3"/></svg>
                  </div>
                  <div>
                    <h4>Chest / Bust</h4>
                    <p>Measure around the fullest part of your chest, keeping the tape horizontal. Do not pull too tight.</p>
                  </div>
                </div>
                <div class="measure-item">
                  <div class="measure-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.75" stroke-linecap="round"><path d="M8 6h8M8 10h8M8 14h4"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                  </div>
                  <div>
                    <h4>Waist</h4>
                    <p>Measure around your natural waist — the narrowest part of your torso, typically 1–2 inches above your belly button.</p>
                  </div>
                </div>
                <div class="measure-item">
                  <div class="measure-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.75" stroke-linecap="round"><path d="M12 2v20M4 7l4-4 4 4M16 17l4 4-4 4"/></svg>
                  </div>
                  <div>
                    <h4>Hips</h4>
                    <p>Stand with feet together and measure around the fullest part of your hips, approximately 8 inches below your waist.</p>
                  </div>
                </div>
                <div class="measure-item">
                  <div class="measure-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.75" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="M4 14l8 8 8-8"/></svg>
                  </div>
                  <div>
                    <h4>Length</h4>
                    <p>Measure from the top of your shoulder to the desired hemline while standing upright.</p>
                  </div>
                </div>
                <div class="measure-item">
                  <div class="measure-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.75" stroke-linecap="round"><path d="M22 12H2M12 2l10 10-10 10"/></svg>
                  </div>
                  <div>
                    <h4>Shoulder</h4>
                    <p>Measure from one shoulder seam to the other across the back of your neck.</p>
                  </div>
                </div>
                <div class="measure-item">
                  <div class="measure-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.75" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h12"/></svg>
                  </div>
                  <div>
                    <h4>Sleeve</h4>
                    <p>From the top of your shoulder to your wrist bone with your arm slightly bent.</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Women's Suits -->
            <section id="women-suits">
              <div class="sg-section-label">Women</div>
              <h2>Women's Suits &amp; Kameez</h2>
              <p>All measurements in <strong>inches</strong>. For cm, multiply by 2.54.</p>
              <div class="sg-table-wrap">
                <table class="sg-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Chest</th>
                      <th>Waist</th>
                      <th>Hips</th>
                      <th>Kameez Length</th>
                      <th>Shoulder</th>
                      <th>PKT Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td class="size-badge">XS</td><td>32–33</td><td>25–26</td><td>34–35</td><td>42</td><td>13.5</td><td>6</td></tr>
                    <tr><td class="size-badge">S</td><td>34–35</td><td>27–28</td><td>36–37</td><td>43</td><td>14</td><td>8</td></tr>
                    <tr class="sg-popular"><td class="size-badge">M <span class="popular-tag">Popular</span></td><td>36–37</td><td>29–30</td><td>38–39</td><td>44</td><td>14.5</td><td>10</td></tr>
                    <tr><td class="size-badge">L</td><td>38–39</td><td>31–32</td><td>40–41</td><td>45</td><td>15</td><td>12</td></tr>
                    <tr><td class="size-badge">XL</td><td>40–42</td><td>33–35</td><td>42–44</td><td>46</td><td>15.5</td><td>14</td></tr>
                    <tr><td class="size-badge">XXL</td><td>43–45</td><td>36–38</td><td>45–47</td><td>47</td><td>16</td><td>16</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Women's Bottoms -->
            <section id="women-bottoms">
              <div class="sg-section-label">Women</div>
              <h2>Women's Shalwar &amp; Trousers</h2>
              <div class="sg-table-wrap">
                <table class="sg-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Waist</th>
                      <th>Hips</th>
                      <th>Inseam</th>
                      <th>Shalwar Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td class="size-badge">XS</td><td>25–26</td><td>34–35</td><td>28</td><td>38</td></tr>
                    <tr><td class="size-badge">S</td><td>27–28</td><td>36–37</td><td>29</td><td>39</td></tr>
                    <tr class="sg-popular"><td class="size-badge">M <span class="popular-tag">Popular</span></td><td>29–30</td><td>38–39</td><td>30</td><td>40</td></tr>
                    <tr><td class="size-badge">L</td><td>31–32</td><td>40–41</td><td>30.5</td><td>41</td></tr>
                    <tr><td class="size-badge">XL</td><td>33–35</td><td>42–44</td><td>31</td><td>42</td></tr>
                    <tr><td class="size-badge">XXL</td><td>36–38</td><td>45–47</td><td>31.5</td><td>43</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Men's Kameez -->
            <section id="men-kameez">
              <div class="sg-section-label">Men</div>
              <h2>Men's Kameez &amp; Kurta</h2>
              <div class="sg-table-wrap">
                <table class="sg-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Chest</th>
                      <th>Waist</th>
                      <th>Kameez Length</th>
                      <th>Shoulder</th>
                      <th>Sleeve</th>
                      <th>PKT Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td class="size-badge">S</td><td>36–37</td><td>30–31</td><td>44</td><td>16</td><td>23.5</td><td>36</td></tr>
                    <tr><td class="size-badge">M</td><td>38–39</td><td>32–33</td><td>45</td><td>16.5</td><td>24</td><td>38</td></tr>
                    <tr class="sg-popular"><td class="size-badge">L <span class="popular-tag">Popular</span></td><td>40–41</td><td>34–35</td><td>46</td><td>17</td><td>24.5</td><td>40</td></tr>
                    <tr><td class="size-badge">XL</td><td>42–43</td><td>36–37</td><td>47</td><td>17.5</td><td>25</td><td>42</td></tr>
                    <tr><td class="size-badge">XXL</td><td>44–46</td><td>38–40</td><td>48</td><td>18</td><td>25.5</td><td>44</td></tr>
                    <tr><td class="size-badge">XXXL</td><td>47–49</td><td>41–43</td><td>49</td><td>18.5</td><td>26</td><td>46</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Men's Shalwar -->
            <section id="men-shalwar">
              <div class="sg-section-label">Men</div>
              <h2>Men's Shalwar &amp; Trousers</h2>
              <div class="sg-table-wrap">
                <table class="sg-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Waist</th>
                      <th>Hips</th>
                      <th>Inseam</th>
                      <th>Shalwar Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td class="size-badge">S</td><td>30–31</td><td>36–37</td><td>30</td><td>42</td></tr>
                    <tr><td class="size-badge">M</td><td>32–33</td><td>38–39</td><td>31</td><td>43</td></tr>
                    <tr class="sg-popular"><td class="size-badge">L <span class="popular-tag">Popular</span></td><td>34–35</td><td>40–41</td><td>31.5</td><td>44</td></tr>
                    <tr><td class="size-badge">XL</td><td>36–37</td><td>42–43</td><td>32</td><td>45</td></tr>
                    <tr><td class="size-badge">XXL</td><td>38–40</td><td>44–46</td><td>32.5</td><td>46</td></tr>
                    <tr><td class="size-badge">XXXL</td><td>41–43</td><td>47–49</td><td>33</td><td>47</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Fit Tips -->
            <section id="tips">
              <div class="sg-section-label">Pro Tips</div>
              <h2>Fit Tips</h2>
              <div class="tips-grid">
                <div class="tip-card">
                  <div class="tip-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.75" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                  </div>
                  <h4>When in doubt, size up</h4>
                  <p>Pakistani suits can always be taken in by a local tailor. It's easier to make a garment smaller than to let it out.</p>
                </div>
                <div class="tip-card">
                  <div class="tip-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.75" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </div>
                  <h4>Measure over undergarments</h4>
                  <p>Take your measurements while wearing the undergarments you'll typically wear under the outfit for the most accurate fit.</p>
                </div>
                <div class="tip-card">
                  <div class="tip-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.75" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                  </div>
                  <h4>Use a cloth tape measure</h4>
                  <p>A flexible cloth or plastic tape measure gives the most accurate results. A ruler or stiff measure won't give true body measurements.</p>
                </div>
                <div class="tip-card">
                  <div class="tip-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.75" stroke-linecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                  </div>
                  <h4>Easy returns within 7 days</h4>
                  <p>Not the right fit? No problem. Return or exchange unused items within 7 days of delivery. See our <a routerLink="/return-policy">Return Policy</a>.</p>
                </div>
              </div>
            </section>

            <!-- CTA -->
            <div class="sg-cta">
              <p>Still unsure? Our team is happy to help you find the perfect fit.</p>
              <div class="sg-cta__btns">
                <a href="mailto:trendzyofficial.store@gmail.com" class="btn btn-primary">Email Us Your Measurements</a>
                <a routerLink="/return-policy" class="btn btn-outline">Return Policy</a>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sg-page { background: var(--cream); min-height: 100vh; }

    .sg-hero {
      background: var(--black); padding: 100px 0 48px; position: relative;
      &::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background:linear-gradient(to right,transparent,#C9A84C,#E2C97E,#C9A84C,transparent); }
      &__label { font-size:0.7rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--gold); margin-bottom:0.75rem; display:block; }
      &__title { font-family:var(--font-heading); font-size:clamp(2.5rem,5vw,3.75rem); font-weight:400; color:var(--cream); margin-bottom:0.75rem; }
      &__sub { font-size:1.0625rem; color:rgba(245,240,232,0.5); font-weight:300; }
    }

    .sg-wrap {
      display:grid; grid-template-columns:220px 1fr; gap:3.5rem; padding:3.5rem 0 6rem; align-items:start;
      @media(max-width:900px) { grid-template-columns:1fr; }
    }

    .sg-toc {
      position:sticky; top:24px;
      @media(max-width:900px) { display:none; }
      .toc-card { background:var(--cream-light); border:1px solid var(--gray-200); padding:1.5rem; margin-bottom:1rem; }
      .toc-heading { font-size:0.65rem; letter-spacing:0.25em; text-transform:uppercase; color:var(--gold-dark); font-weight:700; margin-bottom:1rem; }
      nav { display:flex; flex-direction:column; }
      nav a { font-size:0.8125rem; color:var(--gray-500); text-decoration:none; padding:0.4rem 0.625rem; border-left:2px solid var(--gray-200); transition:all 0.2s; &:hover{color:var(--black);border-left-color:var(--gold);padding-left:0.875rem;} }
    }

    .sg-contact-box {
      background:var(--black); padding:1.25rem 1.5rem;
      p { font-size:0.7rem; letter-spacing:0.15em; text-transform:uppercase; color:rgba(201,168,76,0.6); margin-bottom:0.5rem; }
      a { font-size:0.8125rem; color:rgba(245,240,232,0.65); text-decoration:none; &:hover{color:var(--gold-light);} }
    }

    .sg-intro {
      display:flex; align-items:flex-start; gap:1rem;
      background:var(--cream-light); border-left:4px solid var(--gold); padding:1.25rem 1.5rem; margin-bottom:3rem;
      p { font-size:0.9375rem; line-height:1.8; color:var(--black-soft); margin:0; a{color:var(--gold-dark);text-decoration:underline;text-underline-offset:3px;} }
    }

    .sg-content {
      section { margin-bottom:3rem; padding-bottom:3rem; border-bottom:1px solid var(--gray-200); scroll-margin-top:24px; &:last-of-type{border-bottom:none;} }
      h2 { font-family:var(--font-heading); font-size:1.75rem; font-weight:400; color:var(--black); margin-bottom:1rem; }
      p { font-size:0.9375rem; color:var(--gray-500); line-height:1.8; margin-bottom:1rem; strong{color:var(--black-soft);} }
    }

    .sg-section-label { font-size:0.65rem; letter-spacing:0.3em; text-transform:uppercase; color:var(--gold); font-weight:700; margin-bottom:0.5rem; }

    .measure-grid {
      display:grid; grid-template-columns:1fr 1fr; gap:1rem;
      @media(max-width:600px) { grid-template-columns:1fr; }
    }

    .measure-item {
      display:flex; gap:1rem; align-items:flex-start;
      padding:1.25rem; background:var(--cream-light); border:1px solid var(--gray-200);
      .measure-icon { width:40px; height:40px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:var(--black); border-radius:4px; svg{width:22px;height:22px;} }
      h4 { font-size:0.875rem; font-weight:700; color:var(--black); margin-bottom:0.25rem; }
      p { font-size:0.8125rem; color:var(--gray-400); margin:0; line-height:1.6; }
    }

    .sg-table-wrap { overflow-x:auto; margin-top:1rem; }

    .sg-table {
      width:100%; border-collapse:collapse; font-size:0.875rem;
      thead tr { background:var(--black); th { padding:0.875rem 1rem; text-align:left; font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase; color:var(--gold-light); font-weight:600; white-space:nowrap; } }
      tbody tr {
        border-bottom:1px solid var(--gray-200); transition:background 0.15s;
        &:hover { background:var(--cream-light); }
        &:last-child { border-bottom:none; }
        td { padding:0.875rem 1rem; color:var(--gray-500); white-space:nowrap; }
      }
      .sg-popular { background:rgba(201,168,76,0.04); }
    }

    .size-badge { font-weight:700; color:var(--black-soft) !important; min-width:80px; }
    .popular-tag { font-size:0.6rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; background:var(--gold); color:var(--black); padding:1px 6px; margin-left:0.375rem; border-radius:2px; }

    .tips-grid {
      display:grid; grid-template-columns:1fr 1fr; gap:1rem;
      @media(max-width:600px) { grid-template-columns:1fr; }
    }

    .tip-card {
      padding:1.5rem; background:var(--cream-light); border:1px solid var(--gray-200);
      .tip-icon { width:44px; height:44px; background:var(--black); display:flex; align-items:center; justify-content:center; margin-bottom:1rem; svg{width:22px;height:22px;} }
      h4 { font-size:0.9375rem; font-weight:700; color:var(--black); margin-bottom:0.375rem; }
      p { font-size:0.875rem; color:var(--gray-500); line-height:1.7; margin:0; a{color:var(--gold-dark);text-decoration:underline;text-underline-offset:3px;} }
    }

    .sg-cta {
      background:var(--black); padding:2.5rem; text-align:center; margin-top:3rem;
      p { color:rgba(245,240,232,0.65); font-size:1rem; margin-bottom:1.5rem; }
      &__btns { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
    }
  `]
})
export class SizeGuideComponent {}
