# Marketing Website Updates

## 1. Update SignupForm.tsx

Update the pricing tiers section:

```jsx
// Pricing tiers
const tiers = [
  { id: 'trial', name: 'Free to Try (30-day trial)', price: 'Free' },
  {
    id: 'finance',
    name: 'Finance Managers Only',
    price: (
      <>
        <span className="line-through text-gray-400">$50/month</span>{' '}
        <span className="text-red-500 font-bold">FREE</span>{' '}
        <span className="text-xs text-yellow-400">for a limited time!</span>
      </>
    ),
  },
  { id: 'dealership', name: 'Dealerships', price: '$200/month' },
  { id: 'group', name: 'Dealer Groups', price: '$500/month' },
];
```

Update the form submission handler to handle free Finance Manager tier:

```jsx
// If it's not a free trial or finance promo, redirect to Stripe
if (selectedTier !== 'trial' && selectedTier !== 'finance') {
  // ... existing Stripe checkout code ...
} else {
  // For free trial or finance promo, just show success message
  console.log('Free signup successful');
  setSuccess(true);
}
```

Add promo tracking to signup data:

```jsx
const isFinancePromo = selectedTier === 'finance';

// First, store the signup request in Supabase
console.log('Inserting signup request into Supabase');
const { data, error: supabaseError } = await supabase.from('signup_requests').insert([
  {
    dealership_name: dealershipName,
    contact_person: contactName,
    email,
    phone,
    tier: selectedTier,
    status: selectedTier === 'trial' || isFinancePromo ? 'trial_started' : 'pending_payment',
    promo_applied: isFinancePromo,
    created_at: new Date().toISOString(),
  },
]);
```

Update the submit button text:

```jsx
<button
  type="submit"
  disabled={loading}
  className="w-full bg-gradient-to-r from-electric-magenta to-neon-cyan text-white font-medium py-3 rounded-md transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
>
  {loading
    ? 'Processing...'
    : selectedTier === 'trial' || selectedTier === 'finance'
    ? 'Start Free Access'
    : 'Continue to Payment'}
</button>
```

## 2. Update Homepage (src/app/page.tsx)

Add a promotional banner at the top:

```jsx
{
  /* Promotional Banner */
}
<div className="bg-red-600 text-white py-3">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row items-center justify-center md:justify-between">
      <span className="text-sm md:text-base font-medium mb-2 md:mb-0">
        🎉 Limited Time Offer: Finance Manager Tools Now FREE! 🎉
      </span>
      <Link
        href="/signup?tier=finance"
        className="px-4 py-1 text-xs md:text-sm font-medium text-red-600 bg-white rounded-full hover:bg-red-50"
      >
        Sign Up Now →
      </Link>
    </div>
  </div>
</div>;
```

Update the Pricing Preview section:

```jsx
{
  /* Pricing Preview */
}
<section className="py-20 px-6 max-w-7xl mx-auto">
  <h2 className="text-3xl font-bold text-center mb-4 gradient-text">Try it Now</h2>
  <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
    Finance Manager tools now completely FREE for a limited time!
  </p>
  <div className="grid md:grid-cols-4 gap-6">
    {[
      {
        name: 'Finance Managers',
        price: 'FREE',
        description: 'Keep track of your Deals, Products, PVR and Pay!',
        highlight: true,
      },
      {
        name: 'Finance Managers',
        price: (
          <>
            <span className="line-through text-gray-500">$50/month</span>{' '}
            <span className="text-red-500">FREE</span>
          </>
        ),
        description: 'Individual dashboard for finance professionals.',
        highlight: true,
      },
      {
        name: 'Dealerships',
        price: '$250/month',
        description: 'For up to 15 users with full dealership access.',
      },
      {
        name: 'Dealer Groups',
        price: 'From $200/dealership',
        description: 'Multi-dealership support for dealer groups.',
      },
    ].map((tier, index) => (
      <div
        key={index}
        className={`glow-card p-6 flex flex-col ${tier.highlight ? 'border-2 border-red-500' : ''}`}
      >
        <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
        <p className="text-2xl font-bold text-light-orange my-4">{tier.price}</p>
        <p className="text-gray-300 mb-6">{tier.description}</p>
        <Link
          href={`/signup${tier.highlight ? '?tier=finance' : ''}`}
          className={`mt-auto ${
            tier.highlight
              ? 'animate-pulse bg-gradient-to-r from-red-500 to-orange-500'
              : 'bg-gradient-to-r from-light-orange to-dark-orange'
          } text-center py-2 rounded-md transition-all duration-300 hover:scale-105`}
        >
          {tier.highlight ? 'Get Free Access' : 'Select Plan'}
        </Link>
      </div>
    ))}
  </div>
  <div className="text-center mt-12">
    <Link
      href="/pricing"
      className="text-light-orange font-medium hover:underline transition-all duration-300"
    >
      View Full Pricing Details →
    </Link>
  </div>
</section>;
```

## 3. Update Pricing Page (src/app/pricing/page.tsx)

Update the Finance Manager pricing in the comparison table:

```jsx
<th className="p-4 text-center bg-card-dark border border-gray-700 rounded-tl-lg">
  <div className="text-xl font-bold text-white">Finance Manager Only</div>
  <div className="text-2xl font-bold mt-2">
    <span className="line-through text-gray-400">$5/mo</span>
    <span className="text-red-500">FREE</span>
    <div className="text-yellow-400 text-sm font-normal">Limited Time Offer!</div>
  </div>
</th>
```

Add a promotional banner at the top of the pricing page:

```jsx
{
  /* Promotional Banner */
}
<div className="bg-red-600 text-white py-3 mb-8 rounded-lg">
  <div className="max-w-3xl mx-auto px-4 text-center">
    <span className="text-xl font-bold">🎉 SPECIAL PROMOTION 🎉</span>
    <p className="mt-1">Finance Manager access is now completely FREE for a limited time!</p>
    <Link
      href="/signup?tier=finance"
      className="mt-2 inline-block px-6 py-2 text-sm font-medium text-red-600 bg-white rounded-full hover:bg-red-50"
    >
      Get Free Access Now
    </Link>
  </div>
</div>;
```
