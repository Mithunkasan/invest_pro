// India administrative locations data mapping (State -> District -> City & PIN)
export interface CityInfo {
  name: string
  pinCode: string
}

export interface DistrictInfo {
  name: string
  cities: CityInfo[]
}

export interface StateInfo {
  name: string
  districts: DistrictInfo[]
}

export const INDIA_STATES: StateInfo[] = [
  {
    name: "Maharashtra",
    districts: [
      {
        name: "Mumbai Suburban",
        cities: [
          { name: "Bandra", pinCode: "400050" },
          { name: "Andheri", pinCode: "400053" },
          { name: "Borivali", pinCode: "400091" },
          { name: "Kurla", pinCode: "400070" },
          { name: "Ghatkopar", pinCode: "400077" }
        ]
      },
      {
        name: "Pune",
        cities: [
          { name: "Pune City", pinCode: "411001" },
          { name: "Pimpri", pinCode: "411018" },
          { name: "Kothrud", pinCode: "411038" },
          { name: "Hinjawadi", pinCode: "411057" },
          { name: "Hadapsar", pinCode: "411028" }
        ]
      },
      {
        name: "Nagpur",
        cities: [
          { name: "Nagpur City", pinCode: "440001" },
          { name: "Kamptee", pinCode: "441001" },
          { name: "Hingna", pinCode: "440016" }
        ]
      }
    ]
  },
  {
    name: "Delhi",
    districts: [
      {
        name: "New Delhi",
        cities: [
          { name: "Connaught Place", pinCode: "110001" },
          { name: "Chanakyapuri", pinCode: "110021" },
          { name: "Vasant Kunj", pinCode: "110070" }
        ]
      },
      {
        name: "South Delhi",
        cities: [
          { name: "Saket", pinCode: "110017" },
          { name: "Hauz Khas", pinCode: "110016" },
          { name: "Greater Kailash", pinCode: "110048" }
        ]
      }
    ]
  },
  {
    name: "Karnataka",
    districts: [
      {
        name: "Bengaluru Urban",
        cities: [
          { name: "Majestic", pinCode: "560001" },
          { name: "Whitefield", pinCode: "560066" },
          { name: "Indiranagar", pinCode: "560038" },
          { name: "Jayanagar", pinCode: "560041" },
          { name: "Electronic City", pinCode: "560100" }
        ]
      },
      {
        name: "Mysuru",
        cities: [
          { name: "Mysuru Palace Area", pinCode: "570001" },
          { name: "Gokulam", pinCode: "570002" },
          { name: "Vidyaranyapuram", pinCode: "570008" }
        ]
      }
    ]
  },
  {
    name: "Gujarat",
    districts: [
      {
        name: "Ahmedabad",
        cities: [
          { name: "Navrangpura", pinCode: "380009" },
          { name: "Satellite", pinCode: "380015" },
          { name: "Maninagar", pinCode: "380008" },
          { name: "Vastrapur", pinCode: "380054" }
        ]
      },
      {
        name: "Surat",
        cities: [
          { name: "Varachha", pinCode: "395006" },
          { name: "Adajan", pinCode: "395009" },
          { name: "Udhana", pinCode: "394210" }
        ]
      }
    ]
  },
  {
    name: "Tamil Nadu",
    districts: [
      {
        name: "Chennai",
        cities: [
          { name: "T-Nagar", pinCode: "600017" },
          { name: "Adyar", pinCode: "600020" },
          { name: "Velachery", pinCode: "600042" },
          { name: "Anna Nagar", pinCode: "600040" }
        ]
      },
      {
        name: "Coimbatore",
        cities: [
          { name: "R S Puram", pinCode: "641002" },
          { name: "Gandhipuram", pinCode: "641012" },
          { name: "Peelamedu", pinCode: "641004" }
        ]
      }
    ]
  },
  {
    name: "West Bengal",
    districts: [
      {
        name: "Kolkata",
        cities: [
          { name: "Salt Lake City", pinCode: "700091" },
          { name: "Alipore", pinCode: "700027" },
          { name: "Ballygunge", pinCode: "700019" },
          { name: "Park Street", pinCode: "700016" }
        ]
      },
      {
        name: "Howrah",
        cities: [
          { name: "Howrah Central", pinCode: "711101" },
          { name: "Liluah", pinCode: "711204" },
          { name: "Shalimar", pinCode: "711103" }
        ]
      }
    ]
  },
  {
    name: "Telangana",
    districts: [
      {
        name: "Hyderabad",
        cities: [
          { name: "Gachibowli", pinCode: "500032" },
          { name: "Secunderabad", pinCode: "500003" },
          { name: "Madhapur", pinCode: "500081" },
          { name: "Jubilee Hills", pinCode: "500033" },
          { name: "Banjara Hills", pinCode: "500034" }
        ]
      }
    ]
  }
]
