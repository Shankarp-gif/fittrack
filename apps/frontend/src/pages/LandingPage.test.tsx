import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LandingPage } from './LandingPage'

describe('LandingPage', () => {
  it('shows hero headline', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>,
    )

    expect(screen.getByText('Train Smarter. Get Stronger. Become Your Best.')).toBeTruthy()
  })
})
