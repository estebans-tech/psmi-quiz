import { test, expect } from '@playwright/test'

test('Start → Answer → Reveal → Last → Finish → Results/Repeat', async ({ page }) => {
  // 1) Start
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Scrum PSMI - Trainer/i })).toBeVisible()

  // 👇 Vänta på att Nuxt/Vue hinner binda events (hydration)
  await page.waitForFunction(() => !!(document.getElementById('__nuxt') as any)?.__vue_app__)

  // Klicka Start
  const startBtn = page.getByRole('button', { name: /Start quiz/i })
  await expect(startBtn).toBeVisible()
  await startBtn.click()
  
  // 2) Quiz page — ge navigationen lite mer luft
  await page.waitForURL('**/quiz**', { timeout: 15000 })
  await expect(page.getByRole('heading', { name: /Scrum PSMI - Quiz/i })).toBeVisible()
  
  // Vänta bort ev. "Loading questions…"
  const loading = page.getByText(/Loading questions/i)
  if (await loading.isVisible().catch(() => false)) {
      await expect(loading).toBeHidden({ timeout: 10_000 })
    }
    
    // Välj första alternativet (radio/checkbox) – robust mot okända texter
    const firstOption = page.locator('input[type="radio"], input[type="checkbox"]').first()
    await firstOption.waitFor({ state: 'visible' })
    // .check() fungerar för både radio/checkbox; fallback till click() om lib strukturerar annorlunda
    await firstOption.check({ force: true }).catch(async () => { await firstOption.click({ force: true }) })

    // Check + Reveal
    const checkBtn = page.getByRole('button', { name: /^Check Answer$/ })
    await expect(checkBtn).toBeEnabled()
    await checkBtn.click()

    const revealBtn = page.getByRole('button', { name: /Show Explanation/i }).first()
    await revealBtn.click()

  // Fokus till explanation-region (om någon fråga har explanation; annars hoppa över)
  const regions = page.locator('[role="region"]')
  const regionCount = await regions.count()
  if (regionCount > 0) {
    const region = regions.first()
    await expect(region).toBeVisible()
    await expect(region).toBeFocused()
  }

  // 3) Gå till sista frågan: Next tills disabled
  const nextBtn = page.getByRole('button', { name: /^Next$/ })
  for (let i = 0; i < 200; i++) {
    if (await nextBtn.isDisabled()) break
    await nextBtn.click()
  }
  await expect(nextBtn).toBeDisabled()

  // 4) Finish → Results
  const finishBtn = page.getByRole('button', { name: /^Finish$/ })
  await expect(finishBtn).toBeEnabled()
  await finishBtn.click()

  // Begränsa scope till KPI-griden (3 kort högst upp)
  const summary = page.getByTestId('kpi-summary')
  await expect(summary.getByTestId('kpi-correct')).toBeVisible()
  await expect(summary.getByTestId('kpi-incorrect')).toBeVisible()
  await expect(summary.getByTestId('kpi-total')).toBeVisible()
  
  // 5) Repeat → tillbaka till /quiz
  const repeat = page.getByRole('link', { name: /Repeat/i })
  if (await repeat.isVisible().catch(() => false)) {
    await repeat.click()
    await expect(page).toHaveURL(/\/quiz(\?|$)/)
  }
})
