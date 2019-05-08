/*
This file is part of the Le Mans Size Zimlet.
Copyright (C) 2018 Stéphane Gosnet

Bugs and feedback: https://github.com/sgosnet/zimlet-size

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
*/

/*	02/05/2019 Version 1.1
*	Auteur : Stéphane GOSNET stephane.gosnet@lemans.fr
*/

/*
*	Historique des corrections :
*		Version 1.1 : Affichage des ascenseurs dans la fenêtre du rapport
*/

/*
 * Améliorations à apporter :
 * 	- Ajouter le menu contextuel aux dossiers sur les vues Mail et Porte-documents
*/

/* Bugs :
 *	- Charger le package Briefcase 
*/

/*
 * Cette Zimlet affiche une arborescence de la taille des dossiers Zimbra.
*/

fr_lemans_size_HandlerObject =
function(){
};

fr_lemans_size_HandlerObject.prototype = new ZmZimletBase();
fr_lemans_size_HandlerObject.prototype.constructor = fr_lemans_size_HandlerObject;

/*
 *	Initialise la zimlet.
*/
fr_lemans_size_HandlerObject.prototype.init =
function() {

	// Définit la fonction appelée lors de l'enregistrement des préférences
	this.saveUserProperties(new AjxCallback(this, this.initUserPrefs));
};

/*
 *      Initialise les préférences utilisateur.
*/
fr_lemans_size_HandlerObject.prototype.initUserPrefs =
function() {

       	var zimletInstance = appCtxt._zimletMgr.getZimletByName('fr_lemans_size').handlerObject;
       	(typeof(this.getUserProperty("unit")) != "undefined") ? this.sizeUnit = this.getUserProperty("unit") : this.sizeUnit = zimletInstance._zimletContext.getConfig("defaultUnit");
       	(typeof(this.getUserProperty("level")) != "undefined") ? this.sizeLevel = this.getUserProperty("level") : this.sizeLevel = zimletInstance._zimletContext.getConfig("defaultLevel");
}

/*
 *      MAJ les préférences utilisateur avant sauvegarde.
*/
fr_lemans_size_HandlerObject.prototype.checkProperties =
function(props) {

	for(var i=0; i < props.length ; i++){
		if(props[i].name == "unit" && typeof(props[i].value) != "undefined") this.sizeUnit = props[i].value;
		if(props[i].name == "level" && typeof(props[i].value) != "undefined") this.sizeLevel = props[i].value;
	}
	return true;
}

/*      Lance TreeSize depuis menu contextue lde la Zimlet
 *		itemId : Id du menu contextuel Zimlet
*/
fr_lemans_size_HandlerObject.prototype.menuItemSelected = 
function(itemId) {
	switch (itemId) {
		case "fr_lemans_size_MENU_INBOX":
			var treeSize = this.treeSize(2);
			break;
                case "fr_lemans_size_MENU_SENT":
                        var treeSize = this.treeSize(5);
                        break;
                case "fr_lemans_size_MENU_TRASH":
                        var treeSize = this.treeSize(3);
                        break;
                case "fr_lemans_size_MENU_BRIEFCASE":
			// Charge le Package Briefcase pour accéder aux dossiers Porte-documents 
                        var treeSize = this.treeSize(16);
                        break;
                case "fr_lemans_size_MENU_ROOT":
                        var treeSize = this.treeSize(1);
                        break;
	}
	this.sortTreeSize(treeSize);
	this.displayTreeSize(treeSize);;
};

/*      Lance TreeSize par Glisser sur la Zimlet
 *              zmObject : Object déposé sur la Zimlet
*/
fr_lemans_size_HandlerObject.prototype.doDrop =
function(zmObject) {

console.dir(zmObject);

	if(zmObject[0].TYPE == "ZmFolder"){
console.dir(zmObject[0]);
		var treeSize = this.treeSize(zmObject[0].id);
		this.sortTreeSize(treeSize);
	        this.displayTreeSize(treeSize);;
	}

        if(zmObject[0].type == "BRIEFCASE"){
console.dir(zmObject[0]);
                var treeSize = this.treeSize(zmObject[0].id);
                this.sortTreeSize(treeSize);
                this.displayTreeSize(treeSize);;
        }
}

/*	Construction CSS de la vue Html du TreeSize
 *      Retourne le contenu Html du CSS (String)
*/
fr_lemans_size_HandlerObject.prototype.createCssTreeSize =
function() {
        var n = 0;
	var css= new Array();

        css[n++] = "body{background-color:#fffff4} ";
	css[n++] = "table{border:1px solid black;cellspacing:0} ";
	css[n++] = "tr.titre{background-color:lightgrey} ";
        css[n++] = "tr.dossier{background-color:white} ";
        css[n++] = "th.taille{width:100} ";
        css[n++] = "td.dossier{font-size:small;padding-left:10px;padding-right:30px} ";
        css[n++] = "div.size {background-color:lightsteelblue} ";
        css[n++] = "div.gSize {background-color:lightgreen} ";
        return css.join("");
}

/*      Construire la vue Html du TreeSize
 *       treeSize : Tableau treeSize (Object)
 *	Retourne le contenu Html (String)
*/
fr_lemans_size_HandlerObject.prototype.createHtmlTreeSize =
function(treeSize) {

	this.html=new Array(); // Intilise sortie Html - Déclaration en Propriété de Classe pour accès dans fonction récursive
	var n = 0;
	this.html[n++] = "<html><header><title>Zimbra: "+this.getMessage("frlemanssize_panelLabel")+" [" + treeSize.name + "]</title><style type='text/css'>" + this.createCssTreeSize() + "</style></header><body><table>";
	this.html[n++] = "<tr class='titre'><th>"+this.getMessage("frlemanssize_folderName")+"</th><th nowrap class='taille'>"+this.getMessage("frlemanssize_folderSize")+"</th><th nowrap class='taille'>"+this.getMessage("frlemanssize_folderTotal")+"</th></tr>";
	this.discoverHtmlTreeSize(treeSize,treeSize.globalSize,1);
	this.html[this.html.length+1]="</body></table></html>";
	return this.html.join("");
}


/*      Parcours récursif du TreeSize pour constuire le TreeSize Html
 *       treeSize : Tableau treeSize (Object)
 *      Retourne le contenu Html correspondant au dossier (string)
*/
fr_lemans_size_HandlerObject.prototype.discoverHtmlTreeSize =
function(treeSize,globalSize,level) {

	this.html[this.html.length+1] = "<tr><td nowrap class='dossier'>" + treeSize.path + "</td><td nowrap ><div class='size' style=\"width:" + Math.round(treeSize.size/globalSize*100) + "\">" + this.convertUnits(treeSize.size) + "</div></td><td nowrap><div class='gSize' style=\"width:" +  Math.round(treeSize.globalSize/globalSize*100)  + "\">" + this.convertUnits(treeSize.globalSize) + "</div></td></tr>";
	var nbSousDossiers = treeSize.length;
	var ceNiveau = level;
	if (nbSousDossiers > 0 && (ceNiveau < this.sizeLevel || this.sizeLevel == 0)){
		ceNiveau++;
		for(var i=0; i < nbSousDossiers; i++){
			this.discoverHtmlTreeSize(treeSize[i],globalSize,ceNiveau);
		}
	}
}

/*      Retourne l'affichage de la taille selon l'unité choisie
 *       size : taille en octets (nombre)
 *      Retourne la taille avec l'unité (string)
*/
fr_lemans_size_HandlerObject.prototype.convertUnits =
function(size) {
	var unite = this.sizeUnit;
	var longueur = size.toString().length;

	// Si Auto, détermine la meilleure unité pour la taille donnée
	if(unite.toLowerCase() == "auto" || unite == ""){
		switch ((Math.ceil(longueur/3)-1)){
		 	case 1: unite ="ko";break;
                        case 2: unite ="mo";break;
                        case 3: unite ="go";break;
                        case 4: unite ="to";break;
			default: unite="o";
		}
	}

	// Retourne la taille convertie selon l'unité
	switch(unite.toLowerCase()){
		case "ko":
			return Math.round(size/1024)+" Ko";
			break;
		case "mo":
			return Math.round(size/1024/1024)+" Mo";
			break;
		case "go":
			return Math.round(size/1024/1024/1024)+" Go";
                        break;
                case "to":
                        return Math.round(size/1024/1024/1024/1024)+" To";
                        break;
		default:
                        return Math.round(size);
                        break;
	}
}

/*      Affichage fenetre TreeSize
 *      Affiche l'arobrescence Treesize dans une fenetre séparée
 *       treeSize : Tableau treeSize (Object)
*/
fr_lemans_size_HandlerObject.prototype.displayTreeSize =
function(treeSize) {

        if(typeof this.myWindow !== 'undefined'){
                 this.myWindow.close();
        }

	this.myWindow = window.open("", "TreeSizeZimbra", "width=600,height=800,titlebar=no,menubar=no,scrollbars=yes");
	this.myWindow.document.write(this.createHtmlTreeSize(treeSize)); 
}

/*	Construction de l'arborescence
 *	Construit une collection de l'arborescence du dossier choisi
 *	 avec la taille du dossier, la taille des sous-dossiers et le nombre d'éléments dans le dossier
		folderId : ID du dossier à parcourir (Num)
*	Retourne une collection
*/
fr_lemans_size_HandlerObject.prototype.treeSize =
function(folderId) {

	var folderTreesize = new Array();
	var startFolder = appCtxt.getFolderTree().getById(folderId);

        return this.getFolder(startFolder,"");
}



/*      Parcours récursif de l'arborescence et construction du TreeSize
*		folderTree : Arborescence
*       Retourne le Treesize (Object)
*/
fr_lemans_size_HandlerObject.prototype.getFolder =
function(folderTree,path) {

	var treeSize = new Array();
	var folderChildren = folderTree.children;

	treeSize.name = folderTree.name;
	treeSize.path = path + "/" + treeSize.name;
	treeSize.size = folderTree.sizeTotal;
	treeSize.mails = folderTree.numTotal;
	treeSize.globalSize = treeSize.size;

	if(folderChildren.size() > 0){
		for(var i=0; i < folderChildren.size(); i++){
			var subFolder = this.getFolder(folderChildren._array[i],treeSize.path);
			treeSize.globalSize = treeSize.globalSize + subFolder.globalSize;
			treeSize.push(subFolder);
		}
	}
	return treeSize;
}


/*      Parcours récursif du treeSize et tri des dossiers par ordre décroissant de globalSize
*               treeSize : TreeSize non triée
*       Retourne le Treesize trié (Object)
*/
fr_lemans_size_HandlerObject.prototype.sortTreeSize =
function(folderTree) {

        var sortedTreeSize = new Array();

        if(folderTree.length > 0){
                for(var i=0; i < folderTree.length; i++){

			// Anti-boucle infinie
			if(i>10) return sortedTreeSize;
                        var subFolder = this.sortTreeSize(folderTree[i]);
                        sortedTreeSize.push(subFolder);
                }
        }

        sortedTreeSize = folderTree.sort(function(a,b){return (b.globalSize)-(a.globalSize)});
	return sortedTreeSize;
}
