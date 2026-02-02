export const customers = {
  customerA: {
    id: "CUST-001",

    name: "Miss Katerina Danilovska",
    email: "k.danilovska@gmail.com",

    personal: {
      dob: "13/02/1996",
      phone: "+389 70 456 789",
      address: {
        line1: "3 La Butte Court",
        line2: "La Butte",
        city: "St Peter Port",
        postcode: "GY11XA",
        country: "Guernsey"
      },
      clientSince: "12/12/2010",
      isMainDriver: true
    },

    summary: {
      livePolicies: 3,
      totalGWP: 2800,
      outstandingBalance: 200,
      loyaltyYears: 2,
      openClaims: 0
    },

    connectedClients: [
      { name: "Jon Doe", relationship: "Spouse" },
      { name: "Jake Doe", relationship: "Son" }
    ],

    linkedClients: [
      { name: "Jon Doe", relationship: "Spouse" },
      { name: "Jake Doe", relationship: "Son" }
    ],

    // ✅ NEW: policies that match your Policy/Risk UI
    policies: [
      {
        id: "POL-MTR-001",
        type: "motor",
        ref: "BD5I SMR",
        internalRef: "999/005/A269/JUS",

        status: "live",
        term: "12 Months",
        renewalDate: "12/12/2025",

        productPath: "Open Market Motor • Krypton • Aviva Car 25",

        premium: {
          currency: "GBP",
          gross: 588.0,
          label: "Gross Premium"
        },

        cover: {
          title: "Comprehensive",
          subtitle: "Cover details",
          bullets: [
            "Permitted use: social, domestic and pleasure including commuting",
            "No past claims",
            "Insured only can drive",
            "No open claims",
            "No NCD protection"
          ]
        },

        excesses: {
          title: "Excess",
          items: [
            { label: "Requested voluntary excess", value: "£25.00" },
            { label: "Accidental damage & fire", value: "£500.00" },
            { label: "Third option", value: "£50.00" }
          ]
        },

        riskCard: {
          title: "BD5I SMR",
          subtitle: "Volkswagen T-ROC",
          tags: [
            { text: "Mods (3)", tone: "neutral" },
            { text: "Previous write-off", tone: "warning" },
            { text: "Imported", tone: "neutral" },
            { text: "Left-hand drive", tone: "neutral" },
            { text: "Q-plated", tone: "neutral" }
          ],
          detailsTitle: "Other details about this car:",
          details: [
            "Make 110 TSI Style (2143cc)",
            "Parking: At home",
            "ABI Group 32",
            "First registered 12/02/2015",
            "Vehicle value £10,500",
            "Is garaging in a Car park",
            "Last known mileage is 120,000"
          ]
        },

        people: {
          header: "No additional drivers",
          list: [
            {
              name: "Katerina Danilovska",
              role: "Proposer",
              dob: "13/02/1996",
              bullets: [
                "Occupation: Power engineer",
                "Age at inception: 30",
                "No convictions",
                "5 years NCD"
              ]
            }
          ]
        },

        tasks: {
          openCount: 2,
          label: "Open for this policy"
        },

        policyNav: [
          "Risk",
          "Breakdown",
          "Quote details & conditions",
          "Notes",
          "Checklist",
          "Attachments",
          "History",
          "Tasks",
          "Transactions",
          "Documents",
          "Claims"
        ]
      },

      {
        id: "POL-HME-001",
        type: "home",
        ref: "12 BUCKHOLT",
        internalRef: "999/005/H112/JUS",

        status: "live",
        term: "12 Months",
        renewalDate: "03/06/2025",

        productPath: "Open Market Home • Krypton • Aviva Home Plus",

        premium: {
          currency: "GBP",
          gross: 412.5,
          label: "Gross Premium"
        },

        cover: {
          title: "Buildings & Contents",
          subtitle: "Cover details",
          bullets: [
            "Owner occupied",
            "Buildings sum insured: £280,000",
            "Contents sum insured: £55,000",
            "Accidental damage: Included",
            "No past home claims",
            "Legal expenses: Included"
          ]
        },

        excesses: {
          title: "Excess",
          items: [
            { label: "Voluntary excess", value: "£100.00" },
            { label: "Escape of water", value: "£250.00" },
            { label: "Subsidence", value: "£1,000.00" }
          ]
        },

        riskCard: {
          title: "12 Buckholt Drive",
          subtitle: "Residential property",
          tags: [
            { text: "Cavity wall insulation", tone: "neutral" },
            { text: "No flood history", tone: "neutral" },
            { text: "Standard construction", tone: "neutral" }
          ],
          detailsTitle: "Property details:",
          details: [
            "3 bedroom detached house",
            "Year built: 1980",
            "Construction: Brick / tile",
            "Security: Mortice locks + alarm",
            "Heating: Oil",
            "Occupancy: 365 days"
          ]
        },

        people: {
          header: "Named insured",
          list: [
            {
              name: "Katerina Danilovska",
              role: "Policyholder",
              dob: "13/02/1996",
              bullets: [
                "No home claims in last 5 years",
                "No previous refusals",
                "Property used as primary residence"
              ]
            }
          ]
        },

        tasks: { openCount: 1, label: "Open for this policy" },

        policyNav: [
          "Risk",
          "Breakdown",
          "Quote details & conditions",
          "Notes",
          "Checklist",
          "Attachments",
          "History",
          "Tasks",
          "Transactions",
          "Documents",
          "Claims"
        ]
      },

      {
        id: "POL-TRV-001",
        type: "travel",
        ref: "EUROPE",
        internalRef: "999/005/T771/JUS",

        status: "live",
        term: "Single Trip",
        renewalDate: "—",

        productPath: "Open Market Travel • Krypton • Aviva Travel Select",

        premium: {
          currency: "GBP",
          gross: 86.0,
          label: "Gross Premium"
        },

        cover: {
          title: "European Travel",
          subtitle: "Cover details",
          bullets: [
            "Destination: Europe",
            "Trip dates: 12/05/2025 – 19/05/2025",
            "Cancellation: £2,500",
            "Medical: £5,000,000",
            "Baggage: £1,500",
            "Winter sports: Not included"
          ]
        },

        excesses: {
          title: "Excess",
          items: [
            { label: "Voluntary excess", value: "£0.00" },
            { label: "Medical excess", value: "£75.00" },
            { label: "Baggage excess", value: "£50.00" }
          ]
        },

        riskCard: {
          title: "Europe",
          subtitle: "Single trip",
          tags: [
            { text: "2 travellers", tone: "neutral" },
            { text: "No medical conditions declared", tone: "neutral" }
          ],
          detailsTitle: "Trip details:",
          details: [
            "Travellers: Katerina + Jon Doe",
            "Departure: Guernsey",
            "Purpose: Leisure",
            "Accommodation: Hotel",
            "No winter sports",
            "No cruise cover"
          ]
        },

        people: {
          header: "Travellers",
          list: [
            {
              name: "Katerina Danilovska",
              role: "Lead traveller",
              dob: "13/02/1996",
              bullets: ["No medical conditions declared", "No claims on travel in 3 years"]
            },
            {
              name: "Jon Doe",
              role: "Traveller",
              dob: "02/07/1992",
              bullets: ["No medical conditions declared"]
            }
          ]
        },

        tasks: { openCount: 0, label: "Open for this policy" },

        policyNav: [
          "Risk",
          "Breakdown",
          "Quote details & conditions",
          "Notes",
          "Checklist",
          "Attachments",
          "History",
          "Tasks",
          "Transactions",
          "Documents",
          "Claims"
        ]
      }
    ]
  },

  // --------------------------------------------------------------------

  customerB: {
    id: "CUST-002",

    name: "Mr Daniel Richardson",
    email: "daniel.richardson@outlook.com",

    personal: {
      dob: "22/09/1984",
      phone: "+44 7911 456 123",
      address: {
        line1: "12 Buckholt Drive",
        line2: "",
        city: "Chelmsford",
        postcode: "CM1 4AB",
        country: "United Kingdom"
      },
      clientSince: "03/06/2015",
      isMainDriver: true
    },

    summary: {
      livePolicies: 3,
      totalGWP: 3195,
      outstandingBalance: 0,
      loyaltyYears: 5,
      openClaims: 1
    },

    connectedClients: [{ name: "Sarah Richardson", relationship: "Spouse" }],
    linkedClients: [{ name: "Richardson Consulting Ltd", relationship: "Director" }],

    policies: [
      {
        id: "POL-MTR-002",
        type: "motor",
        ref: "DN24 RCH",
        internalRef: "999/006/A771/RIC",

        status: "live",
        term: "12 Months",
        renewalDate: "03/06/2025",

        productPath: "Open Market Motor • Krypton • Aviva Car 25",

        premium: { currency: "GBP", gross: 742.35, label: "Gross Premium" },

        cover: {
          title: "Comprehensive",
          subtitle: "Cover details",
          bullets: [
            "Permitted use: social, domestic and commuting",
            "Class 1 business use: Included",
            "Any driver: No",
            "Protected NCD: Yes",
            "No open claims"
          ]
        },

        excesses: {
          title: "Excess",
          items: [
            { label: "Requested voluntary excess", value: "£150.00" },
            { label: "Accidental damage & fire", value: "£350.00" },
            { label: "Windscreen", value: "£95.00" }
          ]
        },

        riskCard: {
          title: "DN24 RCH",
          subtitle: "Audi A4 Avant",
          tags: [
            { text: "No mods", tone: "neutral" },
            { text: "UK registered", tone: "neutral" },
            { text: "Right-hand drive", tone: "neutral" }
          ],
          detailsTitle: "Other details about this car:",
          details: [
            "Make 2.0 TDI S line (1968cc)",
            "Parking: Driveway",
            "ABI Group 29",
            "First registered 01/09/2020",
            "Vehicle value £19,250",
            "Garaged: No",
            "Last known mileage is 54,000"
          ]
        },

        people: {
          header: "1 additional driver",
          list: [
            {
              name: "Daniel Richardson",
              role: "Proposer",
              dob: "22/09/1984",
              bullets: ["Occupation: IT consultant", "Age at inception: 41", "No convictions", "9 years NCD"]
            },
            {
              name: "Sarah Richardson",
              role: "Named driver",
              dob: "14/04/1986",
              bullets: ["Occupation: Teacher", "No convictions"]
            }
          ]
        },

        tasks: { openCount: 1, label: "Open for this policy" },

        policyNav: [
          "Risk",
          "Breakdown",
          "Quote details & conditions",
          "Notes",
          "Checklist",
          "Attachments",
          "History",
          "Tasks",
          "Transactions",
          "Documents",
          "Claims"
        ]
      },

      {
        id: "POL-HME-002",
        type: "home",
        ref: "CM1 4AB",
        internalRef: "999/006/H221/RIC",

        status: "live",
        term: "12 Months",
        renewalDate: "03/06/2025",

        productPath: "Open Market Home • Krypton • Aviva Home Plus",

        premium: { currency: "GBP", gross: 528.9, label: "Gross Premium" },

        cover: {
          title: "Buildings & Contents",
          subtitle: "Cover details",
          bullets: [
            "Owner occupied",
            "Buildings sum insured: £360,000",
            "Contents sum insured: £75,000",
            "Accidental damage: Buildings only",
            "Home emergency: Included",
            "No past home claims"
          ]
        },

        excesses: {
          title: "Excess",
          items: [
            { label: "Voluntary excess", value: "£200.00" },
            { label: "Escape of water", value: "£350.00" },
            { label: "Subsidence", value: "£1,000.00" }
          ]
        },

        riskCard: {
          title: "12 Buckholt Drive",
          subtitle: "Residential property",
          tags: [
            { text: "Standard construction", tone: "neutral" },
            { text: "Alarm fitted", tone: "neutral" }
          ],
          detailsTitle: "Property details:",
          details: [
            "4 bedroom detached house",
            "Year built: 2003",
            "Construction: Brick / tile",
            "Security: Alarm + window locks",
            "Heating: Gas boiler",
            "Occupancy: 365 days"
          ]
        },

        people: {
          header: "Named insured",
          list: [
            {
              name: "Daniel Richardson",
              role: "Policyholder",
              dob: "22/09/1984",
              bullets: ["No home claims in last 5 years", "Property used as primary residence"]
            }
          ]
        },

        tasks: { openCount: 0, label: "Open for this policy" },

        policyNav: [
          "Risk",
          "Breakdown",
          "Quote details & conditions",
          "Notes",
          "Checklist",
          "Attachments",
          "History",
          "Tasks",
          "Transactions",
          "Documents",
          "Claims"
        ]
      },

      {
        id: "POL-TRV-002",
        type: "travel",
        ref: "FAMILY-TRAVEL",
        internalRef: "999/006/T551/RIC",

        status: "live",
        term: "Annual Multi-Trip",
        renewalDate: "03/06/2025",

        productPath: "Open Market Travel • Krypton • Aviva Travel Select",

        premium: { currency: "GBP", gross: 124.0, label: "Gross Premium" },

        cover: {
          title: "Worldwide (Ex USA)",
          subtitle: "Cover details",
          bullets: [
            "Annual multi-trip",
            "Worldwide (excluding USA, Canada, Caribbean)",
            "Cancellation: £5,000",
            "Medical: £10,000,000",
            "Baggage: £2,000",
            "Winter sports: Included"
          ]
        },

        excesses: {
          title: "Excess",
          items: [
            { label: "Voluntary excess", value: "£0.00" },
            { label: "Medical excess", value: "£100.00" },
            { label: "Baggage excess", value: "£75.00" }
          ]
        },

        riskCard: {
          title: "Annual Travel",
          subtitle: "Multi-trip",
          tags: [{ text: "2 travellers", tone: "neutral" }],
          detailsTitle: "Traveller details:",
          details: [
            "Travellers: Daniel + Sarah",
            "Max trip length: 31 days",
            "Includes winter sports",
            "No cruise cover"
          ]
        },

        people: {
          header: "Travellers",
          list: [
            {
              name: "Daniel Richardson",
              role: "Lead traveller",
              dob: "22/09/1984",
              bullets: ["Medical conditions declared: None", "No travel claims in 3 years"]
            },
            {
              name: "Sarah Richardson",
              role: "Traveller",
              dob: "14/04/1986",
              bullets: ["Medical conditions declared: None"]
            }
          ]
        },

        tasks: { openCount: 1, label: "Open for this policy" },

        policyNav: [
          "Risk",
          "Breakdown",
          "Quote details & conditions",
          "Notes",
          "Checklist",
          "Attachments",
          "History",
          "Tasks",
          "Transactions",
          "Documents",
          "Claims"
        ]
      }
    ]
  },

  // --------------------------------------------------------------------

  customerC: {
    id: "CUST-003",

    name: "Mrs Helen Whitmore",
    email: "helen.whitmore@gmail.com",

    personal: {
      dob: "08/11/1971",
      phone: "+44 7702 889 456",
      address: {
        line1: "Flat 16",
        line2: "Belgravia Court",
        city: "Brighton",
        postcode: "BN1 6EU",
        country: "United Kingdom"
      },
      clientSince: "18/01/2008",
      isMainDriver: false
    },

    summary: {
      livePolicies: 3,
      totalGWP: 4200,
      outstandingBalance: 650,
      loyaltyYears: 12,
      openClaims: 2
    },

    connectedClients: [
      { name: "Andrew Whitmore", relationship: "Spouse" },
      { name: "Lucy Whitmore", relationship: "Daughter" }
    ],
    linkedClients: [{ name: "Whitmore Properties Ltd", relationship: "Owner" }],

    policies: [
      {
        id: "POL-MTR-003",
        type: "motor",
        ref: "HW71 WHT",
        internalRef: "999/007/A118/WHM",

        status: "live",
        term: "12 Months",
        renewalDate: "18/01/2026",

        productPath: "Open Market Motor • Krypton • Aviva Car 25",

        premium: { currency: "GBP", gross: 965.0, label: "Gross Premium" },

        cover: {
          title: "Comprehensive",
          subtitle: "Cover details",
          bullets: [
            "Permitted use: social, domestic, commuting",
            "Insured + 1 named driver",
            "Protected NCD: No",
            "1 past claim (last 3 years)",
            "No open claims"
          ]
        },

        excesses: {
          title: "Excess",
          items: [
            { label: "Requested voluntary excess", value: "£250.00" },
            { label: "Accidental damage & fire", value: "£500.00" },
            { label: "Theft", value: "£300.00" }
          ]
        },

        riskCard: {
          title: "HW71 WHT",
          subtitle: "BMW X1",
          tags: [
            { text: "No mods", tone: "neutral" },
            { text: "Parking: Street", tone: "warning" }
          ],
          detailsTitle: "Other details about this car:",
          details: [
            "Make xDrive 20d (1995cc)",
            "Parking: Street",
            "ABI Group 27",
            "First registered 09/09/2019",
            "Vehicle value £24,000",
            "Garaged: No",
            "Last known mileage is 62,500"
          ]
        },

        people: {
          header: "1 additional driver",
          list: [
            {
              name: "Helen Whitmore",
              role: "Proposer",
              dob: "08/11/1971",
              bullets: ["Occupation: Finance manager", "Age at inception: 54", "No convictions", "6 years NCD"]
            },
            {
              name: "Andrew Whitmore",
              role: "Named driver",
              dob: "19/03/1969",
              bullets: ["Occupation: Engineer", "No convictions"]
            }
          ]
        },

        tasks: { openCount: 2, label: "Open for this policy" },

        policyNav: [
          "Risk",
          "Breakdown",
          "Quote details & conditions",
          "Notes",
          "Checklist",
          "Attachments",
          "History",
          "Tasks",
          "Transactions",
          "Documents",
          "Claims"
        ]
      },

      {
        id: "POL-HME-003",
        type: "home",
        ref: "BN1 6EU",
        internalRef: "999/007/H009/WHM",

        status: "live",
        term: "12 Months",
        renewalDate: "18/01/2026",

        productPath: "Open Market Home • Krypton • Aviva Home Plus",

        premium: { currency: "GBP", gross: 685.75, label: "Gross Premium" },

        cover: {
          title: "Buildings & Contents",
          subtitle: "Cover details",
          bullets: [
            "Leasehold flat",
            "Contents sum insured: £65,000",
            "Accidental damage: Included",
            "Personal possessions: £3,000",
            "1 past home claim (escape of water)",
            "Legal expenses: Included"
          ]
        },

        excesses: {
          title: "Excess",
          items: [
            { label: "Voluntary excess", value: "£150.00" },
            { label: "Escape of water", value: "£500.00" },
            { label: "Subsidence", value: "£0.00" }
          ]
        },

        riskCard: {
          title: "Belgravia Court",
          subtitle: "Flat 16",
          tags: [
            { text: "Leasehold", tone: "neutral" },
            { text: "Water claim history", tone: "warning" }
          ],
          detailsTitle: "Property details:",
          details: [
            "2 bedroom flat",
            "Construction: Brick / tile",
            "Security: Entry system + window locks",
            "Heating: Electric",
            "Occupancy: 365 days",
            "Floor: 3rd"
          ]
        },

        people: {
          header: "Named insured",
          list: [
            {
              name: "Helen Whitmore",
              role: "Policyholder",
              dob: "08/11/1971",
              bullets: ["1 claim in last 5 years", "Primary residence"]
            }
          ]
        },

        tasks: { openCount: 1, label: "Open for this policy" },

        policyNav: [
          "Risk",
          "Breakdown",
          "Quote details & conditions",
          "Notes",
          "Checklist",
          "Attachments",
          "History",
          "Tasks",
          "Transactions",
          "Documents",
          "Claims"
        ]
      },

      {
        id: "POL-TRV-003",
        type: "travel",
        ref: "WORLDWIDE",
        internalRef: "999/007/T314/WHM",

        status: "live",
        term: "Single Trip",
        renewalDate: "—",

        productPath: "Open Market Travel • Krypton • Aviva Travel Select",

        premium: { currency: "GBP", gross: 132.25, label: "Gross Premium" },

        cover: {
          title: "Worldwide (Incl USA)",
          subtitle: "Cover details",
          bullets: [
            "Destination: USA (New York)",
            "Trip dates: 04/10/2025 – 12/10/2025",
            "Cancellation: £7,500",
            "Medical: £10,000,000",
            "Baggage: £2,000",
            "Cruise cover: Not included"
          ]
        },

        excesses: {
          title: "Excess",
          items: [
            { label: "Voluntary excess", value: "£0.00" },
            { label: "Medical excess", value: "£150.00" },
            { label: "Baggage excess", value: "£75.00" }
          ]
        },

        riskCard: {
          title: "Worldwide",
          subtitle: "Single trip",
          tags: [
            { text: "3 travellers", tone: "neutral" },
            { text: "USA", tone: "warning" }
          ],
          detailsTitle: "Trip details:",
          details: [
            "Travellers: Helen + Andrew + Lucy",
            "Departure: London",
            "Purpose: Leisure",
            "Accommodation: Hotel",
            "No cruise cover"
          ]
        },

        people: {
          header: "Travellers",
          list: [
            {
              name: "Helen Whitmore",
              role: "Lead traveller",
              dob: "08/11/1971",
              bullets: ["Medical conditions declared: None"]
            },
            {
              name: "Andrew Whitmore",
              role: "Traveller",
              dob: "19/03/1969",
              bullets: ["Medical conditions declared: None"]
            },
            {
              name: "Lucy Whitmore",
              role: "Traveller",
              dob: "21/08/2008",
              bullets: ["Medical conditions declared: None"]
            }
          ]
        },

        tasks: { openCount: 0, label: "Open for this policy" },

        policyNav: [
          "Risk",
          "Breakdown",
          "Quote details & conditions",
          "Notes",
          "Checklist",
          "Attachments",
          "History",
          "Tasks",
          "Transactions",
          "Documents",
          "Claims"
        ]
      }
    ]
  }
};
