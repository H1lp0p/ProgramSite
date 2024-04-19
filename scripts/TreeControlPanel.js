let nowTree;
let testData;
let ignoreKeys = [];
let treeTrained = false;

function setIgnore(tree, container){
    let keys = nowTree.getKeys();
    let ignoreForm = document.createElement("form");
    container.append(ignoreForm);
    for (let key of keys){
        let checkBox = document.createElement("input");
        let keyLabel = document.createElement("label");
        let customCheck = document.createElement("span");
        checkBox.setAttribute("type", "checkbox");
        checkBox.name = key;
        checkBox.setAttribute("for", ignoreForm.id);

        keyLabel.setAttribute("class", "inBudy-simpleContent checkbox-label");
        customCheck.setAttribute("class", "custom-checkbox");

        keyLabel.append(key);
        keyLabel.append(checkBox);
        keyLabel.append(customCheck);
        ignoreForm.append(keyLabel);
    }
   /* let checked = ignoreForm.elements.ignore;*/
    ignoreForm.addEventListener("change", function (){

        for (let el of ignoreForm.elements){
            if(el.checked){
                ignoreKeys.push(el.name);
            }
        }
        tree.setIgnoreList(ignoreKeys);
    });
}

function setTarget(tree, container){
    let keys = tree.getKeys();
    let value = document.createElement("button");
    value.setAttribute("class", "inBody-button");
    value.textContent = keys[0];
    tree.setTargetKey(keys[0]);
    value.onclick = function (){
        let nowInd = keys.indexOf(value.textContent);
        if (nowInd === keys.length - 1){
            nowInd = 0;
        }
        else{
            nowInd+=1;
        }
        value.textContent = keys[nowInd];
        tree.setTargetKey(keys[nowInd]);
        tree.setIgnoreList(ignoreKeys);

    };
    container.append(value);
}

function beginTrain(){
    let dialog = document.getElementById("dialog");
    let trainButton = document.createElement("button");
    trainButton.setAttribute("class", "inBody-button");
    trainButton.textContent = "Train";
    trainButton.onclick = function () {
        nowTree.TrainTree(nowTree.getTrainingData().data).then( function (){
            treeTrained = true;
            workerSays();
            workerSays("[system] -> Train Complete, showing result tree:");
            workerSays();
            workerSays("[false <-|-> true]");
            workerSays();
            let treeContainer = document.createElement("div");
            treeContainer.setAttribute("class","tree inBudy-simpleContent");
            viewer(nowTree.getTree(), treeContainer);
            workerSays();
            workerSays(treeContainer);
        });
    };
    dialog.textContent = "";
    workerSays("-> Oh, new data. Well, we need to file some papers.");
    workerSays();
    workerSays("-> Now, set ignore list. Check the keys below");
    workerSays();
    setIgnore(nowTree, dialog);
    workerSays("-> And there we need to choose the attribute, which tree need to find");
    workerSays();
    setTarget(nowTree, dialog);
    workerSays();
    workerSays("-> And, finally, train the tree");
    workerSays();
    workerSays(trainButton);

}

document.getElementById("TrainingFile").addEventListener("change", function (){
    let reader =new FileReader();
    reader.readAsText(document.getElementById("TrainingFile").files[0]);
    document.getElementById("trainingFileName").append(document.getElementById("TrainingFile").files[0].name);

    reader.onload = function (){
        let nowFile =reader.result;
        nowTree = new Tree(nowFile);
        treeTrained = false;
        beginTrain();
    }
});

document.getElementById("TestFile").addEventListener("change", function (){
    let reader =new FileReader();
    reader.readAsText(document.getElementById("TestFile").files[0]);
    document.getElementById("TestFileName").append(document.getElementById("TestFile").files[0].name);

    reader.onload = function (){
        let nowFile =reader.result;
        testData = csvToRawData(nowFile);
        if(nowTree !== undefined && treeTrained){
            TestCalc(testData);
        }
        else{
            workerSays();
            workerSays("-> *sigh* Dear Client, please, train tree on some data first.");
            workerSays();
            workerSays("-> If you look at the bottom of your screen, you may find two buttons. Please, read the text above these buttons.");
            workerSays();
            workerSays("-> Then do the things in correct order, it's really easy. I will use this test after.");
        }
    }
});

function csvToRawData(csv){
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

function workerSays(element){
    if(element === undefined){
        document.getElementById("dialog").append(document.createElement("br"));
    }
    else{
        document.getElementById("dialog").append(element);
    }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function TestCalc(test){
    data = test.data[0];
    console.log("-------------")
    console.log(test);
    workerSays("-> Lets see");
    workerSays();
    let nowNodeName = "root";
    let tree = nowTree.getTree();
    while (tree[nowNodeName].question !== "none"){
        let nowNode = tree[nowNodeName];
        workerSays(`->"${nowNode.question}"`);
        let result = nowTree.calcQuest(data[nowNode.attribute], nowNode.borderSign, nowNode.borderVal);
        workerSays(` We have ${data[nowNode.attribute]} so it's ${result}. Go to ${(result) ? "right" : "left"}.`);
        workerSays();
        nowNodeName = nowNode.question + `_${result}`;
        await sleep(100);
    }
    let res = tree[nowNodeName].result;
    workerSays(`-> And the answer is ${res}. Thanks for using our service, you may go.`);
    workerSays();
}