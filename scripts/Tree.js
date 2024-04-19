let TestData;


function Tree(csvText){

    //Uses to separate dataSet into next two sets
    let borderFunc = {
        ">" : function (val, borderVal) {return val > borderVal;},
        "==" : function (val, borderVal) {return val === borderVal;}
    }

    this.csvToRawData = function(csv){
        let data = [];
        let lines = csv.split(/\r\n|\n/);
        let keys = lines[0].split(',');

        for (let line of lines.slice(1)){
            let element = line.split(',');
            let elData = {};
            for (let dataInd = 0; dataInd < element.length; dataInd++){
                let num = +element[dataInd];
                elData[keys[dataInd]] = (isNaN(num)) ? element[dataInd] : num;
            }
            data.push(elData);
        }

        return {keys : keys, data : data};
    }

    this.setIgnoreList = function (keys){
        ignoreKeys.clear();
        for (let key of keys){
            ignoreKeys.add(key);
        }
        console.log(ignoreKeys);
    }

    this.setTargetKey = function (key){

        for (let nowKey of trainingData["keys"]){
            if (nowKey === key){
                targetKey = key;
                ignoreKeys.add(key);
                return;
            }
        }
        console.log(trainingData["keys"]);
        console.log("there is no such key as " + key + " in training data set.");
    }

    this.getKeys = function (){
        return trainingData.keys;
    }

    this.getTrainingData = function (){
        return trainingData;
    }

    this.calcProps = function (data){
        let result = {};

        for (let el of data){
            if (result[el] !== undefined){
                result[el] += 1;
            }
            else{
                result[el] = 1;
            }
        }

        for (let val of Object.keys(result)){
            result[val] /= data.length;
        }

        return result;
    }

    this.entropy = function (data, key){
        let vals = [];
        for (let el of data){
            vals.push(el[key]);
        }
        let props = this.calcProps(vals);
        let res = 0;
        for (let prop of Object.values(props)){
            res += -(prop * Math.log(prop));
        }

        return res;
    }

    this.genQuestion = function(key, border, borderValue){
        return `Does ${key} ${border} ${borderValue}?`;
    }

    this.chooseVal = function (data){
        let vals = {};
        for (let el of data){
            if (vals[el[targetKey]] !== undefined){
                vals[el[targetKey]] += 1;
            }
            else{
                vals[el[targetKey]] = 1;
            }
        }

        let res;
        let mxCount = 0;
        for (let key of Object.keys(vals)){
            if (vals[key] > mxCount){
                res = key;
                mxCount = vals[key];
            }
        }
        return res;
    }

    this.TrainTree = async function (nowData, nowNode = "root"){
        let startEntropy = this.entropy(nowData, targetKey);
        //console.log(nowData);
        if (startEntropy <= minEntropy){
            tree[nowNode] = {
                question : "none",
                result : this.chooseVal(nowData)
            }
            return;
        }
        let resultBorder = "==";
        let resultBorderValue = nowData[0]["person"];
        let resultAtribute = "person";
        let resultInfoWin = -1;

        for (let atribute of trainingData.keys){
            let skip = false;
            for (let key of ignoreKeys){
                if (key === atribute){
                    //console.log(`${atribute} skipped for ${nowNode}.`);
                    skip = true;
                    break;
                }
            }
            if (skip) continue;

            let nowValuse = [];
            let isNum = (typeof nowData[0][atribute]) == "number";
            for (let el of nowData){
                nowValuse.push(el[atribute]);
            }
            let border = (isNum) ? ">" : "==";
            let borderValue;

            let valueSet = new Set(nowValuse);
            let infoWin = -1;

            for (let nowBorder of valueSet){
                let rightSide = nowData.filter(el => borderFunc[border](el[atribute], nowBorder));
                let leftSide = nowData.filter(el => !borderFunc[border](el[atribute], nowBorder));

                let leftEntropy = this.entropy(leftSide, targetKey);
                let rightEntropy = this.entropy(rightSide, targetKey);

                let nowInfoWin = startEntropy - (leftEntropy + rightEntropy);

                if (nowInfoWin > infoWin){
                    infoWin = nowInfoWin;
                    borderValue = nowBorder;
                }
            }

            if (infoWin > resultInfoWin){
                resultAtribute = atribute;
                resultBorder = border;
                resultBorderValue = borderValue;
                resultInfoWin = infoWin;
            }
        }

        let leftSide, rightSide;
        rightSide = nowData.filter(el => borderFunc[resultBorder](el[resultAtribute], resultBorderValue));
        leftSide = nowData.filter(el => !borderFunc[resultBorder](el[resultAtribute], resultBorderValue));

        let question = this.genQuestion(resultAtribute, resultBorder, resultBorderValue);
        tree[nowNode] = {
            question : question,
            entropy : startEntropy,
            questionFunc : function (val){return borderFunc[resultBorder](val, resultBorderValue);},
            children : [`${question}_false`, `${question}_true`]
        };
/*        tree.nowNode.question = question;
        tree[nowNode].entropy = startEntropy;
        tree[nowNode].questionFunc = function (val){return borderFunc[resultBorder](val, resultBorderValue);};
        tree[nowNode].children = [`${question}_true`, `${question}_false`];*/
        tree[`${question}_true`] = {};
        tree[`${question}_false`] = {};

        this.TrainTree(leftSide, `${question}_false`);
        this.TrainTree(rightSide, `${question}_true`);
    }

    this.getTree = function (){
        return tree;
    }

    //Data to create decision tree
    let trainingData = this.csvToRawData(csvText);
    //Decision tree with {"nowNode" : {question: "", questionFunc: function, entropy : num, children : []}} struct
    let tree = {root : {}};
    //this key tree need to find
    let targetKey;
    //range of attributes, which tree will ignore
    let ignoreKeys = new Set();
    //when entropy cross this minimum, tree stops growing
    let minEntropy = 0.0001;
}

//TODO: all of cosmetic staf + little bit of restructuration of code

async function viewer(tree, container, nodeName = "root"){
    let root = document.createElement("ul");
    let node = document.createElement("li");
    let quest = document.createElement("a");
    let children = document.createElement("ul");
    quest.append(tree[nodeName].question);


    for (let childName of tree[nodeName].children) {
        console.log(childName);
        let child = document.createElement("li");

        if (tree[childName].question !== "none") {
            await viewer(tree, child, childName);
        }
        else{
            let el = document.createElement("a");
            el.append(tree[childName].result);
            child.append(el);
        }
        children.append(child);
    }
    node.append(quest);
    node.append(children);
    root.append(node);
    container.append(root);
}

