import re

files = [
  "client/src/components/FitnessChatBot.jsx",
  "client/src/pages/AdminBugs.jsx",
  "client/src/pages/AdminCustomerDetail.jsx",
  "client/src/pages/AdminCustomers.jsx",
  "client/src/pages/AdminDashboard.jsx",
  "client/src/pages/AdminInventory.jsx",
  "client/src/pages/AdminMarketing.jsx",
  "client/src/pages/AdminReports.jsx",
  "client/src/pages/Authentication.jsx",
  "client/src/pages/Checkout.jsx",
  "client/src/pages/HomePage.jsx",
  "client/src/pages/LandingPage.jsx",
  "client/src/pages/LegalPrivacy.jsx",
  "client/src/pages/LegalTerms.jsx",
  "client/src/pages/MobilityRecoveryPlans.jsx",
  "client/src/pages/MuscleBuildingPlans.jsx",
  "client/src/pages/PaymentPage.jsx",
  "client/src/pages/ProductConfirmation.jsx",
  "client/src/pages/ProductPage.jsx",
  "client/src/pages/Profile.jsx",
  "client/src/pages/WeightLossPlans.jsx"
]

for f in files:
    with open(f, "r", encoding="utf-8") as file:
        lines = file.readlines()
    cleaned = [line for line in lines if "fonts.googleapis.com" not in line]
    with open(f, "w", encoding="utf-8") as file:
        file.writelines(cleaned)
    print("Fixed: " + f)

print("All done!")