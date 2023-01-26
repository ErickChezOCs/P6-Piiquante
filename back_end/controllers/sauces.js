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
  // si userId se trouve déja dans usersLiked ou usersDisliked
 // il faut d'abord modifier ce statut avant qu'il puisse à nouveau 
 // liker ou disliker c'est la première condition à vérifier
 let etatLike = Sauce.usersLiked.includes(req.body.userId);
 let etatDislike =  Sauce.usersDisliked.includes(req.body.userId);
 console.log(etatLike,etatDislike);

 // Le code  doit s'exécuter que pour un etatLike ou etatDislike false
 // pour un etatLike false like peut avoir la valeur 1
 if (!etatLike)  {
  if (req.body.like === 1) {
    Sauce.updateOne(
      { _id: req.params.id },
      { $inc: { likes: +1 }, $push: { usersLiked: req.body.userId } }
    )
      .then(() => {
        res.status(201).json({ message: "One like" });
        console.log("l'utilisateur a liké!");
      })
      .catch((error) => res.status(400).json(error));
  }
  // sinon la valeur autorisée est 0
 } else {
  if (req.body.like === 0) {
    Sauce.findOne({ _id: req.params.id }).then((Sauce) => {
      if (Sauce.usersLiked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
        )
          .then(() => {
            res.status(201).json({ message: "No more like" });
          })
          .catch((error) => res.status(400).json(error));
      }
    });
  }  
 }
// la même logique doit s'appliquer à dislike, l'utilisateur ne peut disliker que s'il
// ne l'a déja fait sinon il doit d'abord supprimer son précédent dislike
if(!etatDislike) {
  if ( req.body.like === -1) {
    Sauce.updateOne(
      { _id: req.params.id },
      { $inc: { dislikes: +1 }, $push: { usersDisliked: req.body.userId } }
    )
      .then(() => {
        res.status(201).json({ message: "One dislike" });
        console.log("l'utilisateur a disliké!");
      })
      .catch((error) => res.status(400).json(error));
  }  
} else {
  if (req.body.like === 0) {
    Sauce.findOne({ _id: req.params.id }).then((Sauce) => {
      if (Sauce.usersDisliked.includes(req.body.userId)) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
        )
          .then(() => {
            res.status(201).json({ message: "No more dislike" });
          })
          .catch((error) => res.status(400).json(error));
      }
    });
  }
};
}
  



  


