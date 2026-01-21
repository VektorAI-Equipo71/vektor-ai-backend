# Pasos en la creación del Set de Datos final

Para formar el set de datos propio se recurrió a datos de aerolíneas del [Bureau of Transportation Statistics](https://www.transtats.bts.gov/DL_SelectFields.aspx?gnoyr_VQ=FGJ&QO_fu146_anzr=) del Departamento de transporte de Estados Unidos (United States Department of Transportation) (Consultado el 17 de diciembre de 2025). 

1) Se decidió tomar un año de datos, desde octubre de 2024 a septiembre de 2025 e inicialmente trabajar con las 109 variables de la base de datos.
  https://www.kaggle.com/datasets/spmv1980/hackaton-2025-equipo-71?select=flight_delays_one_year.csv
  
2) Por motivos de procesamiento, se trabajó de forma preliminar con todas las variables, pero sólo dos aerolíneas para que el set de datos pudiese ser leído en la cuenta gratuita de Google Colab (desde octubre de 2024 a septiembre de 2025)
  https://www.kaggle.com/datasets/spmv1980/hackaton-2025-equipo-71?select=flight_delays_one_year_2a.csv
  
3) Una vez que se realizaron algunos modelos preliminares, se procedió a trabajar con las quince aerolíneas disponibles entre octubre de 2024 y septiembre de 2025, pero sólo variables candidatas para el modelo.
  https://www.kaggle.com/datasets/spmv1980/hackaton-2025-equipo-71?select=flight_delays_15_aerolineas.csv

4) El set de datos usado para los modelos (sin variables climáticas), posterior a la limpieza de datos se puede descargar desde:
   https://www.kaggle.com/datasets/spmv1980/hackaton-2025-equipo-71?select=df_procesado_todas+las+aerolneas.csv

5) Finalmente, al set de datos procesado con todas las aerolíneas se le agregaron variables climáticas a partir de estaciones meteorológicas asociadas a cada aeropuerto:
  https://www.kaggle.com/datasets/spmv1980/hackaton-2025-equipo-71?select=df_procesado_clima.csv
