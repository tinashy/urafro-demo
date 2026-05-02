/* =========================================================================
   AUTH-01 — Phone signup
   Two sub-steps:
     1. Phone entry  (+263 prefix locked, 9-digit local number)
     2. OTP entry    (hardcoded code '123456' — fake auth)
   On verify success → navigate('/onboarding/1') and seed merchant phone.
   ========================================================================= */

window.Screens.auth = {
  title: 'Sign in',
  render(state) {
    const sub = state.route.args[0] || 'phone';
    return sub === 'otp' ? renderOtp(state) : renderPhone(state);
  },
  init(state) {
    const sub = state.route.args[0] || 'phone';
    if (sub === 'otp') wireOtp(state); else wirePhone(state);
  },
};

/* --------------- Step 1: phone entry --------------- */
function renderPhone(state) {
  const draft = state.auth.phoneDraft;
  const valid = /^\d{9}$/.test(draft.replace(/\s/g, ''));
  return `
    <section class="screen layout-stack">
      <div class="screen-body app-container" style="padding-top:48px">
        <div class="hero">
          <div class="hero-brand">urAfro</div>
          <h1 class="hero-title">Run your shop from your phone.</h1>
          <p class="hero-sub">Sign in with your phone number. We'll text you a 6-digit code — no passwords.</p>
        </div>

        <div class="stack stack-md" style="margin-top:32px">
          <div class="field">
            <label class="field-label" for="phoneInput">Phone number</label>
            <div class="field-input">
              <span class="field-input-prefix">+263</span>
              <input id="phoneInput" type="tel" inputmode="numeric"
                     placeholder="77 234 5678" autocomplete="tel-national"
                     value="${draft}" maxlength="13">
            </div>
            <p class="field-hint">Zimbabwe numbers only for the beta. We'll never share your number.</p>
          </div>

          <button id="phoneNext" class="btn btn-primary btn-block" ${valid ? '' : 'disabled'}>
            Send code
          </button>
        </div>
      </div>

      <footer class="screen-footer">
        <p class="text-xs text-subtle text-center" style="margin:0">
          By continuing you agree to urAfro's <a class="btn-link">terms</a> and <a class="btn-link">privacy</a>.
        </p>
      </footer>
    </section>
  `;
}

function wirePhone(state) {
  const input = document.getElementById('phoneInput');
  const btn = document.getElementById('phoneNext');
  if (!input || !btn) return;

  // Auto-format: insert spaces every 2 then 3 then 4 digits → "77 234 5678"
  const fmt = (raw) => {
    const d = raw.replace(/\D/g, '').slice(0, 9);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
    return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
  };

  input.addEventListener('input', (e) => {
    const formatted = fmt(e.target.value);
    e.target.value = formatted;
    state.auth.phoneDraft = formatted;
    const valid = /^\d{2}\s\d{3}\s\d{4}$/.test(formatted);
    btn.disabled = !valid;
  });

  input.focus();

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    state.auth.phone = '+263 ' + state.auth.phoneDraft;
    navigate('/auth/otp');
  });

  // Enter to submit
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !btn.disabled) btn.click();
  });
}

/* --------------- Step 2: OTP entry --------------- */
function renderOtp(state) {
  const phone = state.auth.phone || '+263 77 234 5678';
  return `
    <section class="screen layout-stack">
      <header class="screen-header">
        <button class="screen-header-back" onclick="navigate('/auth')" aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1>Verify number</h1>
        <span style="width:40px"></span>
      </header>

      <div class="screen-body app-container">
        <div class="stack stack-md" style="margin-top:24px">
          <div>
            <p class="text-bold" style="margin:0 0 4px">Enter the 6-digit code</p>
            <p class="text-sm text-muted" style="margin:0">
              Sent to <span class="text-bold" style="color:var(--c-ink)">${phone}</span>
            </p>
          </div>

          <div class="otp-row" id="otpRow">
            ${[0,1,2,3,4,5].map(i => `<input class="otp-box" data-i="${i}" type="tel" inputmode="numeric" maxlength="1" autocomplete="one-time-code">`).join('')}
          </div>

          <p class="text-sm text-muted text-center" style="margin:0">
            Demo code: <span class="text-bold" style="color:var(--c-primary-dark);font-family:var(--font-mono)">123456</span>
          </p>

          <p class="text-sm" style="margin:0;text-align:center">
            <button class="btn-link" onclick="UI.toast('Code resent — demo code is still 123456')">Resend code</button>
            <span class="text-muted">  ·  </span>
            <button class="btn-link" onclick="navigate('/auth')">Use a different number</button>
          </p>

          <div id="otpError" class="text-sm text-danger text-center" style="display:none">
            That code didn't match. Try again.
          </div>

          <button id="otpVerify" class="btn btn-primary btn-block" disabled>
            Verify and continue
          </button>
        </div>
      </div>
    </section>
  `;
}

function wireOtp(state) {
  const boxes = Array.from(document.querySelectorAll('.otp-box'));
  const verify = document.getElementById('otpVerify');
  const error = document.getElementById('otpError');
  if (!boxes.length || !verify) return;

  const collect = () => boxes.map(b => b.value).join('');
  const refresh = () => {
    const full = collect();
    verify.disabled = full.length !== 6;
    if (full.length === 6) error.style.display = 'none';
  };

  boxes.forEach((box, i) => {
    box.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 1);
      if (e.target.value && i < 5) boxes[i + 1].focus();
      refresh();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
      if (e.key === 'Enter' && !verify.disabled) verify.click();
    });
    box.addEventListener('paste', (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
      if (pasted.length === 6) {
        e.preventDefault();
        boxes.forEach((b, j) => b.value = pasted[j] || '');
        boxes[5].focus();
        refresh();
      }
    });
  });

  boxes[0].focus();

  verify.addEventListener('click', () => {
    const code = collect();
    if (code === '123456') {
      // Seed merchant phone in onboarding state, then advance.
      state.onboarding.phone = state.auth.phone;
      navigate('/onboarding/1');
    } else {
      error.style.display = 'block';
      boxes.forEach(b => b.value = '');
      boxes[0].focus();
      verify.disabled = true;
    }
  });
}
