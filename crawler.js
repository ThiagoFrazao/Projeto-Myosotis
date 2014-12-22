var request = require('request')
  , cheerio = require('cheerio')
  , async = require('async')
  , format = require('util').format
  , Parse = require('node-parse-api').Parse
  , mongoose = require('mongoose');

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
  // Create your schemas and models here.
  
});
var desaparecido = new mongoose.Schema({
	  nome: { type: String }
	, img: String
	, status: String
	, data: String
	, local: String
	, mais: String
	});

	// Compile a 'Movie' model using the movieSchema as the structure.
	// Mongoose also creates a MongoDB collection called 'Movies' for these documents.
	var Desaparecido = mongoose.model('Desaparecido', desaparecido);
mongoose.connect('mongodb://localhost/myosotis');
// instantiate
/*
var APP_ID = 'j2lEE7HSOkEndQ0ZhZjfFGQ9vNOUMsvv9JappIPf';
var REST_API_KEY = '6FfGoukX0uG6r1C6gci6Z6MIzaDNieEYofu35704';
var app = new Parse(APP_ID, REST_API_KEY);

app.insert('TestObject', { foo: 'bar' }, function (err, response) {
          console.log(response);
        });
*/
var ufs = [ 'AL','AM','BA','DF','ES','GO','MA','MG','MT','PA','PE','PI','PR','RJ','RN','RR','RS','SC','SE','SP','TO' ]
  , concurrency = 2, casos = 0;

async.eachLimit(ufs, concurrency, function (uf, next) {
    var url = format('http://www.desaparecidos.gov.br/index.php/desparecidos/?situacao=FALSE&uf=%s&submit=Consultar', uf);
    request(url, function (err, response, body) {
        if (err) throw err;
        var $ = cheerio.load(body);

        $('.boxDesaparecidor').each(function () {
		      var nome = $(this).find('.titulo').text().trim();
		      var img = $(this).find('img').attr('src').trim();
		      var status = $(this).find('.desaparecido').text().trim();

		      if (status=='' || status==undefined) {
		        status = $(this).find('.encontrado').text().trim();
		      }
		      
		      var data = $(this).find('.dt').text().trim();
		      var local = $(this).find('.local').text().trim();
		      var mais = $(this).find('.readmore a').attr('href').trim();
		      casos++;
		      // app.insert('Desaparecido', { Nome: nome }, function (err, response) {
		      //   console.log(response);
		      // });

		      //console.log('\n\nNome: %s\nFoto: %s\nStatus: %s\nData: %s\nLocal: %s\nLeia mais em: %s ', nome, img, status, data, local, mais);
		      var registro = new Desaparecido({
				  nome: nome
				, img: img
				, status: status
				, data: data
				, local: local
				, mais: mais
			});

			registro.save(function(err, registro) {
			  if (err) return console.error(err);
			  console.dir(registro);
			});
        });
        next();
        console.log('Número de casos: '+casos);
    });
    
});
/*
var limite = 2512;
//async.eachLimit(estados, concurrency, function (estado, next) {
async.times(limite, function (id, next) { 
    var url = format('http://portal.mj.gov.br/Desaparecidos/frmCriancaDetalhe.aspx?id=%s', id);
    request(url, function (err, response, body) {
        if (err) throw err;
        var $ = cheerio.load(body);

        var nome = $('#lblNome').text();
        
        
        casos=id;
        if (nome!=undefined && nome!='') {
          var img = $('#imgFoto1').attr('src');
          var status = "Desaparecido";     
          var data = $('#lblDataDesaparecimento').text();

          console.log('\n\nNome: %s\nFoto: %s\nStatus: %s\nData: %s ', nome, img, status, data);
        };
         
        next();
        console.log('Número de casos: '+casos);
    });
    
});*/

// var estados = ['sao-paulo','rio-de-janeiro','bahia','parana','rio-grande-do-sul','santa-catarina',''];
// async.eachLimit(estados, concurrency, function (estado, next) {
//   for (var offset = 0; offset < 300; offset = offset+10) {

//     var url = format('http://www.desaparecidosdobrasil.org/criancas-desaparecidas/%s?offset=%d', estado, offset);
//     request(url, function (err, response, body) {
//         if (err) throw err;
//         var $ = cheerio.load(body);

//         /*var paginacao = $('div.sites-pagination-info').text();
//         paginacao = paginacao.split(' ');
//         paginacao = paginacao[5];*/

//         $('.announcement').each(function () {
//           var nome = $(this).find('h4 a').text();

          
//             nome = nome.trim();
//             var mais = $(this).find('h4 a').attr('href');
//             var img = $(this).find('.sites-layout-tile.sites-tile-name-content-2').find('img').attr('src');

//             console.log('\n\nNome: %s\nFoto: %s\nLocal: %s\nLeia mais em: http://www.desaparecidosdobrasil.org%s ', nome, img, estado, mais);

//             var verificador = nome + img + estado + mais;
//           if (verificador!=undefined || verificador!='') {
//             next();
//           }
          
//           casos++;
          
//         });
//         next();
//         console.log('Número de casos: '+casos);
//     });
//   }
    
// });


// var x=[];i=1;while(x.push(i++)<1576);
// async.eachLimit(x, concurrency, function (id, next) {
  
//     var url = format('http://www.desaparecidos.mg.gov.br/album.asp?pg=%d', id);

//     request(url, function (err, response, body) {
//         if (err) throw err;
//         var $ = cheerio.load(body);

//         //var tabela = $('table tr:nth-child(7)').find('table');
//         $('table tr:nth-child(7) table td:nth-child(odd)').each(function () {
//           var nome = $(this).find('.txtalbum1').text();
//           var mais = $(this).find('table a').attr('href');
//           var img = $(this).find('table a img').attr('src');

//           console.log('\n\nNome: %s\nFoto: %s\nLeia mais em: http://www.desaparecidos.mg.gov.br%s ', nome, img, mais);

//           casos++;
          
//         });
//         next();
//         console.log('Número de casos: '+casos);
//     });
  
    
// });

