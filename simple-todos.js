Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // this code only runs on the client
  Template.body.helpers({
    tasks: function () {
      if (Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}})
      } else {
        // Otherwise, return all of the tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      console.log(Session)
      return Session.get("hideCompleted");
    },
    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count(); // $ne --> NOT EQUAL
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      console.log(event)
      //prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;

      // Insert a task into the collection
      Meteor.call("addTask", text);
      // Tasks.insert({
      //   text: text,
      //   createdAt: new Date(),            // current time
      //   owner: Meteor.userId(),           // _id of logged in user
      //   username: Meteor.user().username  // username of logged in user
      // });

      // Clear the form
      event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });

  Template.task.events({
    "click .toggle-checked": function() {
      // Set the checked property to the opposite of its current value
      // Tasks.update(this._id, {
      //   $set: {checked: ! this.checked}
      // });
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      // Tasks.remove(this._id);
      Meteor.call("deleteTask", this._id)
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function (text) {
    //Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized!");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: {checked: setChecked} });
  }
});
