const trips = [
  {
    id: 1,
    date: 'Yesterday',
    score: 7.2,
    distance: '45.6 mi',
    from: 'Midtown, San Jose, CA',
    to: 'Downtown, San Francisco, CA',
  },
  {
    id: 2,
    date: 'Oct 12',
    score: 8.3,
    distance: '837.9 mi',
    from: 'Burbank Avenue, San Martin, CA',
    to: 'Llagas Avenue, Los Angeles, CA',
  },
];

const drivingData = [
  {
    id: 1,
    status: 'bad',
    action: 'breaking',
    icon: require('../assets/images/Icon/BreakingBad.png'),
  },
  {
    id: 2,
    status: 'fair',
    action: 'speeding',
    icon: require('../assets/images/Icon/SpeedingFair.png'),
  },
  {
    id: 3,
    status: 'good',
    action: 'breaking',
    icon: require('../assets/images/Icon/BreakingGood.png'),
  },
];

const location = {
  latitude: 40.73978092263567,
  longitude: -73.87333547273988,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
}

const categories = [
  {
    id: 'plants',
    name: 'Plants',
    tags: ['products', 'inspirations'],
    count: 147,
    image: require('../assets/assets/icons/plants.png'),
  },
  {
    id: 'seeds',
    name: 'Seeds',
    tags: ['products', 'shop'],
    count: 16,
    image: require('../assets/assets/icons/seeds.png'),
  },
  {
    id: 'flowers',
    name: 'Flowers',
    tags: ['products', 'inspirations'],
    count: 68,
    image: require('../assets/assets/icons/flowers.png'),
  },
  {
    id: 'sprayers',
    name: 'Sprayers',
    tags: ['products', 'shop'],
    count: 17,
    image: require('../assets/assets/icons/sprayers.png'),
  },
  {
    id: 'pots',
    name: 'Pots',
    tags: ['products', 'shop'],
    count: 47,
    image: require('../assets/assets/icons/pots.png'),
  },
  {
    id: 'fertilizers',
    name: 'fertilizers',
    tags: ['products', 'shop'],
    count: 47,
    image: require('../assets/assets/icons/fertilizers.png'),
  },
];

const products = [
  {
    id: 1,
    name: '16 Best Plants That Thrive In Your Bedroom',
    description:
      'Bedrooms deserve to be decorated with lush greenery just like every other room in the house – but it can be tricky to find a plant that thrives here. Low light, high humidity and warm temperatures mean only certain houseplants will flourish.',
    tags: ['Interior', '27 m²', 'Ideas'],
    images: [
      require('../assets/assets/images/plants_1.png'),
      require('../assets/assets/images/plants_2.png'),
      require('../assets/assets/images/plants_3.png'),
      // showing only 3 images, show +6 for the rest
      require('../assets/assets/images/plants_1.png'),
      require('../assets/assets/images/plants_2.png'),
      require('../assets/assets/images/plants_3.png'),
      require('../assets/assets/images/plants_1.png'),
      require('../assets/assets/images/plants_2.png'),
      require('../assets/assets/images/plants_3.png'),
    ],
  },
];

const explore = [
  // images
  require('../assets/assets/images/explore_1.png'),
  require('../assets/assets/images/explore_2.png'),
  require('../assets/assets/images/explore_3.png'),
  require('../assets/assets/images/explore_4.png'),
  require('../assets/assets/images/explore_5.png'),
  require('../assets/assets/images/explore_6.png'),
];

const profile = {
  username: 'react-ui-kit',
  location: 'Europe',
  email: 'contact@react-ui-kit.com',
  avatar: require('../assets/assets/images/avatar.png'),
  budget: 1000,
  monthly_cap: 5000,
  notifications: true,
  newsletter: false,
};

export {categories, explore, products, profile, trips};
