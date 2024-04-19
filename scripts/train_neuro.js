let inputLayerNeuronsNumber = 784;
let hiddenLayerNeuronsNumber = 350;
let outputLayerNeuronsNumber = 10;
let learning_rate = 0.1;

function sigmoid(x) {
    return (1 / (1 + Math.exp(-x)));
}

function sigmoidDerivative(x) {
    return x * (1 - x);
}

let hidden_weights = new Array(hiddenLayerNeuronsNumber);
for (let i = 0; i < hiddenLayerNeuronsNumber; i++) {
    hidden_weights[i] = new Array(inputLayerNeuronsNumber);
    for (let j = 0; j < inputLayerNeuronsNumber; j++) {
        hidden_weights[i][j] = Math.random() * 4 - 3;
    }
}
hidden_weights = hidden_weights.map(function (elem) {
    return elem.map(function (num) {
        return num * Math.sqrt(2 / inputLayerNeuronsNumber);
    });
});


let hidden_bias = new Array(hiddenLayerNeuronsNumber);
for (let i = 0; i < hiddenLayerNeuronsNumber; i++) {
    hidden_bias[i] = [0];
}

let output_weights = new Array(outputLayerNeuronsNumber);
for (let i = 0; i < outputLayerNeuronsNumber; i++) {
    output_weights[i] = new Array(hiddenLayerNeuronsNumber);
    for (let j = 0; j < hiddenLayerNeuronsNumber; j++) {
        output_weights[i][j] = Math.random() * 5 - 2;
    }
}

let output_bias = new Array(outputLayerNeuronsNumber);
for (let i = 0; i < outputLayerNeuronsNumber; i++) {
    output_bias[i] = [0];
}

function np_dot_0(mtx1, arr) {
    let res = new Array(mtx1.length);
    for (let i = 0; i < mtx1.length; i++) {
        res[i] = [0];
        for (let k = 0; k < mtx1[0].length; k++) {
            res[i][0] += mtx1[i][k] * (arr[k] / 255);
        }
    }
    return res;
}

function np_dot(mtx1, mtx2) {
    let res = new Array(mtx1.length);
    for (let i = 0; i < mtx1.length; i++) {
        res[i] = new Array(mtx2[0].length);
        for (let j = 0; j < mtx2[0].length; j++) {
            res[i][j] = 0;
            for (let k = 0; k < mtx1[0].length; k++) {
                res[i][j] += mtx1[i][k] * mtx2[k][j];
            }
        }
    }
    return res;
}

function np_sum(mtx1, mtx2) {
    for (let i = 0; i < mtx1.length; i++) {
        for (let j = 0; j < mtx1[0].length; j++) {
            mtx1[i][j] += mtx2[i][j];
        }
    }
    return mtx1;
}

function np_minus(mtx1, mtx2) {
    for (let i = 0; i < mtx1.length; i++) {
        for (let j = 0; j < mtx1[0].length; j++) {
            mtx1[i][j] -= mtx2[i][j];
        }
    }
    return mtx1;
}

function sigmoidForMTX(mtx) {
    return mtx.map(function (elem) {
        return elem.map(function (num) {
            return sigmoid(num);
        });
    });
}

function sigmoidDerivativeForMTX(mtx) {
    return mtx.map(function (elem) {
        return elem.map(function (num) {
            return sigmoidDerivative(num);
        });
    });
}

function np_t(mtx) {
    let res = new Array(mtx[0].length);
    for (let i = 0; i < mtx[0].length; i++) {
        res[i] = new Array(mtx.length);
        for (let j = 0; j < mtx.length; j++) {
            res[i][j] = mtx[j][i];
        }
    }
    return res;
}

function np_product(mtx1, mtx2) {
    for (let i = 0; i < mtx1.length; i++) {
        for (let j = 0; j < mtx1[0].length; j++) {
            mtx1[i][j] = mtx1[i][j] * mtx2[i][j];
        }
    }
    return mtx1;
}

function np_product_0(mtx1, num) {
    for (let i = 0; i < mtx1.length; i++) {
        for (let j = 0; j < mtx1[0].length; j++) {
            mtx1[i][j] = mtx1[i][j] * num;
        }
    }
    return mtx1;
}


function train(inputs, desired_output) {
    let hidden_layer_in = np_sum(np_dot(hidden_weights, inputs), hidden_bias);
    let hidden_layer_out = sigmoidForMTX(hidden_layer_in);

    let output_layer_in = np_sum(np_dot(output_weights, hidden_layer_out), output_bias);
    let predicted_output = sigmoidForMTX(output_layer_in);

    let error = np_minus(desired_output, predicted_output);
    let d_predicted_output = np_product(error, sigmoidDerivativeForMTX(predicted_output));

    let error_hidden_layer = np_dot(np_t(d_predicted_output), output_weights);
    let d_hidden_layer = np_product(np_t(error_hidden_layer), sigmoidDerivativeForMTX(hidden_layer_out));

    output_weights = np_sum(np_product_0(np_t(np_dot(hidden_layer_out, np_t(d_predicted_output))), learning_rate));
    let sum = 0;
    for (let i = 0; i < d_predicted_output.length; i++) {
        sum += d_predicted_output[i] * self.learning_rate;
    }

    for (let i = 0; i < output_bias.length; i++) {
        output_bias.length[i]+=sum;
    }
    hidden_weights
}

/*def train(self, inputs, desired_output):

self.hidden_weights += inputs.dot(d_hidden_layer.T).T * self.learning_rate
self.hidden_bias += np.sum(d_hidden_layer, axis=0, keepdims=True) * self.learning_rate*/


function predict(inputs) {
    let hidden_layer_in = np_sum(np_dot(hidden_weights, inputs), hidden_bias);
    let hidden_layer_out = sigmoidForMTX(hidden_layer_in);

    let output_layer_in = np_sum(np_dot(output_weights, hidden_layer_out), output_bias);
    let predicted_output = sigmoidForMTX(output_layer_in);

    return predicted_output;
}

let mnist_train;
let mnist_test;

async function setData() {
    mnist_test = await fetch("../NeuroMnist/mnist_handwritten_test.json")
        .then((res) => {
            if (!res.ok) {
                throw new Error
                (`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            return data
        });
    console.log(mnist_test[0].label);

    mnist_train = await fetch("../NeuroMnist/mnist_handwritten_train.json")
        .then((res) => {
            if (!res.ok) {
                throw new Error
                (`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            return data
        });
    console.log(mnist_train[0].label);
    main();
}

setData();

function fromArrToMTX(arr) {
    let res = new Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        res[i] = [arr[i] / 255];
    }
    return res;
}

function main() {
    for (let i in mnist_train) {
        let inputs = fromArrToMTX(i.image);

        let desired_output = new Array(10);
        desired_output[i.label] = 1;

        train(inputs, desired_output);
    }


    let correct_counter = 0;
    for (let i = 0; i < 10000; i++) {
        let prediction_list = predict(fromArrToMTX(mnist_test[i].image));

        let out_index = -1;
        let m = -1;
        for (let j = 0; j < 10; j++) {
            if (prediction_list[j][0] > m) {
                out_index = j;
                m = prediction_list[j][0];
            }

        }
        /*let out_index = prediction_list.indexOf(Math.max(...prediction_list));*/
        console.log(out_index);
        if (out_index === mnist_test[i].label) {
            correct_counter++;
        }
    }

    let accuracy = correct_counter / 10000;

    console.log("Accuracy is : ", accuracy * 100, " %");
}