//aby nebyly citlive udaje z configu jako cisla portu, adresy databazi apod pristupne venku (napr na githubu), tak se ty udaje presunou do jsonu, ktery se
//tady importuje a pokud je env test nebo development tak se pouziji ty udaje z lokalniho config.json

//env test je nastavene v package.json kdyz se spousti testovani


//pokud je env production (na heroku) tak neni if splneno a vubec to neprobehne a heroku si to nastavuje samo



let env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  let config = require('./config.json');
  let envConfig = config[env];

  
  
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key]
  })
}

//config[env] je bracket notation a podle toho jaka je hodnota env tak je to stejne jako config.development nebo config.test

//envConfig je tedy bud objekt test nebo objekt development z config.json

//Object.keys() vezme nejaky objekt a vsechny key hodi do array, ktere projdeme pomoci forEach a pomoci bracket notation nastavime potrebne parametry...
// postupne to tedy udela process.env.PORT = test.PORT a proces.env.MONGODB_URI = '...TodoAppTest' a nebo ... = development.PORT a development.MONGODB_URI...





