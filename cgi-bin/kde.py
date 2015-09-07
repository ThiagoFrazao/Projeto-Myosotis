from joblib import Parallel, delayed  
import multiprocessing
import psycopg2
import sys
import numpy as np
import scipy.stats  # Para o kernel density estimation
import cgi, cgitb
import hashlib
import redis
cgitb.enable()  # debug

data = cgi.FieldStorage()

latitude = []
longitude = []
estado = []

try:
    dataFromPHP = sys.argv[1]
except:
    print "ERROR"
    sys.exit(1)

#verifica se essa consulta ja esta em cache
redis = redis.Redis('localhost')
chave = '3'#hashlib.md5(dataFromPHP).hexdigest()
if(redis.get(chave) == ''):
	print redis.get(chave)
else:
	#substitua com os dados do seu banco
	try:
		conn = psycopg2.connect("host='localhost' dbname='banco' user='usuario' password='pass'")
	except:
		print "Nao conectou!"

	#database operations
	cur = conn.cursor()

	cur.execute(dataFromPHP)
	linhas = cur.fetchall()

	cur.close()
	conn.close()

	def pegaLatLonUF(linhas):
		for linha in linhas:
			latitude.append( float(linha[0]) )
			longitude.append( float(linha[1]) )
			estado.append(linha[2])
		return latitude, longitude, estado

	m1, m2, uf = pegaLatLonUF(linhas)

	values = np.vstack([m1, m2])

	tam = len(values[0])
	limite = range(tam)
	fator = 50000

	#Calculo do KDE
	kernel = scipy.stats.kde.gaussian_kde(values)

	#Descomente o codigo abaixo se vc estiver usando uma maquina multicore e comente o codigo sequencial
	#Paralelo
	'''
	if tam < 1000:
		numThreads = 1
	else:
		numThreads = tam/1000

	def recuperaArrayPDFParalelo(j):
		return kernel.evaluate(np.vstack([values[0][j], values[1][j]]))[0]*fator

	print Parallel(n_jobs=numThreads, backend="threading")(delayed(recuperaArrayPDFParalelo)(j) for j in limite)
	'''
	#Sequencial
	def recuperaArrayPDF(kernel, values, estados):
		lst = {}
		for j in range(tam):
			PDF = kernel.evaluate(np.vstack([values[0][j], values[1][j]]))[0]*fator
			nomeEstado = str(estados[j])
			try:
				lst[nomeEstado] = (PDF+lst[nomeEstado])
			except KeyError:
				lst[nomeEstado] = PDF
		return lst

	CDFs = recuperaArrayPDF(kernel, values, uf)
	
	#grava a nova consulta no redis (cache)
	redis.set(chave, CDFs)
	
	#resultado enviado 
	print CDFs