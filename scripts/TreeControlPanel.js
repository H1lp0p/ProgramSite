let nowTree;

document.getElementById("TrainingFile").addEventListener("change", function (){
    let reader =new FileReader();
    reader.readAsText(document.getElementById("TrainingFile").files[0]);
    document.getElementById("trainingFileName").append(document.getElementById("TrainingFile").files[0].name);

    reader.onload = function (){
        let nowFile =reader.result;
        nowTree = new Tree(nowFile);
        console.log(nowTree.getTrainingData());
        nowTree.setIgnoreList(["person"]);
        nowTree.setTargetKey("sex");
        nowTree.TrainTree(nowTree.getTrainingData().data);


        let keys = nowTree.getKeys();
        panel = document.getElementById("panel");

        for (let key of keys){
            let checkBox = document.createElement("input");
            checkBox.setAttribute("type", "checkbox");
            checkBox.id = `nowCheckBox_for_${key}`;
            let keyLabel = document.createElement("label");
            keyLabel.setAttribute("for", checkBox.id);
            keyLabel.setAttribute("class", "inBudy-simpleContent");
            keyLabel.append(key);
            panel.append(checkBox);
            panel.append(keyLabel);
        }

        let treeContainer = document.getElementById("treeContainer");
        viewer(nowTree.getTree(), treeContainer);
    }
});

