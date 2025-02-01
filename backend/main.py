from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "Hello, World!"

@app.route("/api/v1/hello-world")
def hello_world_api():
    return "Hello, World!"

@app.route("/api/v1/add/<int:num1>/<int:num2>")
def add_numbers(num1, num2):
    result = num1 + num2
    return {"result": result}


if __name__ == "__main__":
    app.run(debug=True)
