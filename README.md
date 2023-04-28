# Az-xp
- Gérer un système de level-up facile, utilise MySQL.
- Managing a level-up system easy, uses MySQL.


# Install
- Vous pouvez le télécharger depuis github.
- Placer le dossier dans node_modules de votre Bot.


```js
/* xpFor Example */
const AzXp = require("az-xp");
// Renvoie l’xp requis pour atteindre le niveau 20.
var xpRequired = Levels.xpFor(20);

console.log(xpRequired); // Output: 40000
```

# Setting Up
Tout d’abord, nous incluons le module dans le projet.
```js
const AzXp = require("az-xp");
```
Après cela, vous devez fournir les informations de base de données MySQL valide et la définir. Pour ce faire, vous pouvez :
```js
AzXp.sql(host, port, database, user, password, table); // Vous n’avez besoin de le faire qu’une seule fois par processus.
```

# Methods

**createUser**

Crée une entrée dans la base de données pour cet utilisateur si elle n’existe pas.
```js
AzXp.createUser(<GuildID - String>, <UserID - String>);
```
**deleteUser**

Si l’entrée existe, elle la supprime de la base de données.
```js
AzXp.deleteUser(<GuildID - String>, <UserID - String>);
```
**deleteGuild**

Si l’entrée existe, elle la supprime de la base de données.
```js
Levels.deleteGuild(<GuildID - String>);
```
**appendXp**

Il ajoute une quantité spécifiée d’xp à la quantité actuelle d’xp pour cet utilisateur, dans cette guilde. Il recalcule le niveau. Il crée un nouvel utilisateur avec cette quantité d’xp, s’il n’y a pas d’entrée pour cet utilisateur.
```js
Levels.appendXp(<GuildID - String>, <UserID - String>, <Amount - Integer>);
```
**appendLevel**

Il ajoute un nombre spécifié de niveaux au montant actuel, recalcule et définit l’xp requis pour atteindre le nouveau nombre de niveaux.
```js
AzXp.appendLevel(<GuildID - String>, <UserID - String>, <Amount - Integer>);
```
**setXp**

Il définit l’xp sur un montant spécifié et recalcule le niveau.
```js
AzXp.setXp(<GuildID - String> <UserID - String>, <Amount - Integer>);
```
**setLevel**

Calcule l’xp requis pour atteindre un niveau spécifié et le met à jour.
```js
AzXp.setLevel(<GuildID - String>, <UserID - String>, <Amount - Integer>);
```
**subtractXp**

Il supprime une quantité spécifiée d’xp à la quantité actuelle d’xp pour cet utilisateur, dans cette guilde. Il recalcule le niveau.
```js
AzXp.subtractXp(<GuildID - String>, <UserID - String>, <Amount - Integer>);
```
**subtractLevel**

Il supprime un nombre spécifié de niveaux au montant actuel, recalcule et définit l’xp requis pour atteindre le nouveau nombre de niveaux.
```js
AzXp.subtractLevel(<GuildID - String>, <UserID - String>, <Amount - Number>);
```
**xpFor**

Il renvoie un nombre qui indique la quantité d’xp requise pour atteindre un niveau basé sur l’entrée.
```js
AzXp.xpFor(<TargetLevel - Integer>);
```
