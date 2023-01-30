const Sauce = require("../models/Sauce");
const fs = require("fs"); 

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Sauce saved !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
 

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

 

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modify!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce deleted" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

 

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

  

exports.likedSauce = (req, res, next) => {
  // vérifier l'état courant de like compris entre 1 et -1
  if(req.body.like <= 1 && req.body.like >= -1) {
      Sauce.findOne({_id: req.params.id})
          .then(sauce => {
            // supprimer s'il y en a les doublons de userId dans usersLiked et Disliked
              sauce.usersLiked = [...new Set(sauce.usersLiked)]; 
              sauce.usersDisliked = [...new Set(sauce.usersDisliked)];
              switch (req.body.like) {
                  // parcourir les trois cas possibles
                  case 0 : 
                      if (sauce.usersLiked.includes(req.body.userId)) {
                          sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId), 1);
                          sauce.likes = sauce.usersLiked.length;
                      } else if (sauce.usersDisliked.includes(req.body.userId)){
                          sauce.usersDisliked.splice(sauce.usersLiked.indexOf(req.body.userId), 1);
                          sauce.dislikes = sauce.usersDisliked.length;
                      } else {
                          throw err;
                      }
                      break;
                  case 1 : 
                      if (!sauce.usersLiked.includes(req.body.userId)){
                          sauce.usersLiked.push(req.body.userId);
                          sauce.likes = sauce.usersLiked.length;
                          break;
                      } else {
                          throw err;
                      }
                  case -1 :
                      if (!sauce.usersDisliked.includes(req.body.userId)) {
                          sauce.usersDisliked.push(req.body.userId);
                          sauce.dislikes = sauce.usersDisliked.length;
                          break;
                      } else {
                          throw err;
                      }
              }
              Sauce.updateOne({_id: req.params.id}, sauce)
                  .then(() => res.status(200).json("liked or not!"))
                  .catch(error => res.status(400).json({error}));
              })
          .catch(error => res.status(404).json({error}));         
  } else {
      throw err;
  }

}



  


