const dish_arr = [
    {
        keyword: 'gazpacho',
        name: 'Гаспачо',
        price: 195,
        category: 'soup',
        count: '350г',
        image: 'styles/images/soups/gazpacho',
        kind: 'veg'
    },
    {
        keyword: 'mushroom_soup',
        name: 'Грибной суп-пюре',
        price: 185,
        category: 'soup',
        count: '330г',
        image: 'styles/images/soups/mushroom_soup',
        kind: 'veg'
    },
    {
        keyword: 'norwegian_soup',
        name: 'Норвежский суп',
        price: 270,
        category: 'soup',
        count: '330г',
        image: 'styles/images/soups/norwegian_soup',
        kind: 'fish'
    },
    {
        keyword: 'chicken',
        name: 'Куриный суп',
        price: 330,
        category: 'soup',
        count: '350г',
        image: 'styles/images/soups/chicken',
        kind: 'meat'
    },
    {
        keyword: 'tomyum',
        name: 'Том-Ям',
        price: 650,
        category: 'soup',
        count: '500г',
        image: 'styles/images/soups/tomyum',
        kind: 'fish'
    },
        {
        keyword: 'ramen',
        name: 'Рамен',
        price: 375,
        category: 'soup',
        count: '425г',
        image: 'styles/images/soups/ramen',
        kind: 'meat'
    },
    {
        keyword: 'friedpotatoeswithmushrooms',
        name: 'Жареная картошка с грибами',
        price: 150,
        category: 'dish',
        count: '250г',
        image: 'styles/images/dish/friedpotatoeswithmushrooms1',
        kind: 'veg'
    },
    {
        keyword: 'lasagna',
        name: 'Лазанья',
        price: 385,
        category: 'dish',
        count: '310г',
        image: 'styles/images/dish/lasagna',
        kind: 'meat'
    },
        {
        keyword: 'fishrice',
        name: 'Рис с рыбой',
        price: 320,
        category: 'dish',
        count: '270г',
        image: 'styles/images/dish/fishrice',
        kind: 'fish'
    },
        {
        keyword: 'pizza',
        name: 'Пицца',
        price: 450,
        category: 'dish',
        count: '470г',
        image: 'styles/images/dish/pizza',
        kind: 'veg'
    },
        {
        keyword: 'shrimppasta',
        name: 'Паста с креветками',
        price: 340,
        category: 'dish',
        count: '280г',
        image: 'styles/images/dish/shrimppasta',
        kind: 'fish'
    },
    {
        keyword: 'chickencutletsandmashedpotatoes',
        name: 'Котлеты из курицы с картофельным пюре',
        price: 225,
        category: 'dish',
        count: '280г',
        image: 'styles/images/dish/chickencutletsandmashedpotatoes',
        kind: 'meat'
    },
    {
        keyword: 'orangejuice',
        name: 'Апельсиновый сок',
        price: 120,
        category: 'drinks',
        count: '300мл',
        image: 'styles/images/drinks/orangejuice',
        kind: 'cold'
    },
    {
        keyword: 'applejuice',
        name: 'Яблочный сок',
        price: 90,
        category: 'drinks',
        count: '300мл',
        image: 'styles/images/drinks/applejuice',
        kind: 'cold'
    },
    {
        keyword: 'carrotjuice',
        name: 'Морковный сок',
        price: 110,
        category: 'drinks',
        count: '300мл',
        image: 'styles/images/drinks/carrotjuice',
        kind: 'cold'
    },
    {
        keyword: 'cappuccino',
        name: 'Капучино',
        price: 180,
        category: 'drinks',
        count: '300мл',
        image: 'styles/images/drinks/cappuccino',
        kind: 'hot'
    },
    {
        keyword: 'greentea',
        name: 'Зеленый чай',
        price: 100,
        category: 'drinks',
        count: '300мл',
        image: 'styles/images/drinks/greentea',
        kind: 'hot'
    },
    {
        keyword: 'tea',
        name: 'Черный чай',
        price: 90,
        category: 'drinks',
        count: '300мл',
        image: 'styles/images/drinks/tea',
        kind: 'hot'
    },
    {
        keyword: 'baklava',
        name: 'Пахлава',
        price: 220,
        category: 'deserts',
        count: '300гр',
        image: 'styles/images/deserts/baklava',
        kind: 'medium'
    },
    {
        keyword: 'checheesecake',
        name: 'Чизкейк',
        price: 240,
        category: 'deserts',
        count: '125гр',
        image: 'styles/images/deserts/checheesecake',
        kind: 'small'
    },
    {
        keyword: 'chocolatecake',
        name: 'Шоколадный торт',
        price: 270,
        category: 'deserts',
        count: '140гр',
        image: 'styles/images/deserts/chocolatecake',
        kind: 'big'
    },
    {
        keyword: 'chocolatecheesecake',
        name: 'Шоколадный чизкейк',
        price: 260,
        category: 'deserts',
        count: '125гр',
        image: 'styles/images/deserts/chocolatecheesecake',
        kind: 'small'
    },
    {
        keyword: 'donuts',
        name: 'Пончики 6 штук',
        price: 650,
        category: 'deserts',
        count: '700гр',
        image: 'styles/images/deserts/donuts',
        kind: 'big'
    },
    {
        keyword: 'donuts2',
        name: 'Пончики 3 штуки',
        price: 410,
        category: 'deserts',
        count: '350гр',
        image: 'styles/images/deserts/donuts2',
        kind: 'medium'
    },
    {
        keyword: 'caesar',
        name: 'Цезарь',
        price: 370,
        category: 'salats',
        count: '270гр',
        image: 'styles/images/salats/caesar',
        kind: 'meat'
    },
    {
        keyword: 'caprese',
        name: 'Капрезе',
        price: 350,
        category: 'salats',
        count: '235гр',
        image: 'styles/images/salats/caprese',
        kind: 'veg'
    },
    {
        keyword: 'frenchfries1',
        name: 'Картофель фри с соусом цезарь',
        price: 280,
        category: 'salats',
        count: '235гр',
        image: 'styles/images/salats/frenchfries1',
        kind: 'veg'
    },
    {
        keyword: 'frenchfries2',
        name: 'Картофель фри с кетчупом',
        price: 260,
        category: 'salats',
        count: '235гр',
        image: 'styles/images/salats/frenchfries2',
        kind: 'veg'
    },
    {
        keyword: 'saladwithegg',
        name: 'Коерйский салат с овощами и яйцом',
        price: 330,
        category: 'salats',
        count: '250гр',
        image: 'styles/images/salats/saladwithegg',
        kind: 'veg'
    },
    {
        keyword: 'tunasalad',
        name: 'Салат с тунцом',
        price: 480,
        category: 'salats',
        count: '250гр',
        image: 'styles/images/salats/tunasalad',
        kind: 'fish'
    } 
]