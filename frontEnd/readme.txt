
hard coded :

app = Flask(__name__)
# app.config['MYSQL_HOST'] = process.env.DB_HOST,
# app.config['MYSQL_USER'] = process.env.DB_USERNAME,
# app.config['MYSQL_HOST'] = process.env.DB_PASSWORD,
# app.config['MYSQL_DB'] = process.env.DB_NAME

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)