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
        ignoreKeys.add(targetKey);
        for (let key of keys){
            ignoreKeys.add(key);
        }
    }

    this.setTargetKey = function (key){
        for (let nowKey of trainingData["keys"]){
            if (nowKey === key){
                ignoreKeys.delete(targetKey);
                targetKey = key;
                ignoreKeys.add(targetKey);
                return;
            }
        }
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

    this.TrainTree = async function (nowData, nowNode = "root", nowHeight = 0){
        let startEntropy = this.entropy(nowData, targetKey);
        if (startEntropy <= minEntropy || nowHeight >= maxHeight){
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
            let borderValue = -1;

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
            layer : nowHeight,
            question : question,
            entropy : startEntropy,
            attribute : resultAtribute,
            borderVal : resultBorderValue,
            borderSign : resultBorder,
            children : [`${question}_false`, `${question}_true`]
        };
        tree[`${question}_true`] = {};
        tree[`${question}_false`] = {};

        this.TrainTree(leftSide, `${question}_false`, nowHeight + 1);
        this.TrainTree(rightSide, `${question}_true`, nowHeight + 1);
    }

    this.getTree = function (){
        return tree;
    }

    this.debugStats = function (){
        return [trainingData, ignoreKeys, targetKey];
    }

    this.calcQuest = function (value, border, borderValue){
        return borderFunc[border](value, borderValue);
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
    let maxHeight = 10;
}

//TODO: all of cosmetic staf + little bit of restructuration of code

async function viewer(tree, container, nodeName = "root"){
    let root = document.createElement("ul");
    let node = document.createElement("li");
    let quest = document.createElement("a");
    let children = document.createElement("ul");
    quest.append(tree[nodeName].question);

    if(tree[nodeName].children.length !== 0){
        for (let childName of tree[nodeName].children) {
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
    }
    node.append(quest);
    node.append(children);
    root.append(node);
    container.append(root);
}

