let p = new Promise((resolve, reject) => {

   resolve(2);
});

let vracena = p.then((value) => {
    console.log(value);
    
    return 'blablo'
}).then((value) => {
    console.log(value);
    
});


let druhypokus = () => {
    return p.then((value) => {
        return value
    });
};

console.log('vratka', druhypokus());
console.log(p)


// console.log('jen p', p)
// console.log('s then', p.then(() => {console.log('ahoj')}))

// p.then((value) => {
//     console.log(value);
// });
