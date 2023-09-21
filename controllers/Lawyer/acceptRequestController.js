import { NotificationModel } from "../../models/Notification/notification.js";
import { UserModel } from "../../models/Users/user.js";

export const getAllRequests = async (req, res) => {
  try {
    // Retrieve all notifications from the Notification database
    const notifications = await NotificationModel.find();
    // Create an array to store the details of users who sent requests
    const userRequests = [];
    // Iterate through each notification
    for (const notification of notifications) {
      // Find the user details corresponding to the userid in the notification
      const user = await UserModel.findById(notification.userid);
      // If a user is found, add their details to the userRequests array
      if (user) {
        userRequests.push({
          user: user,
          notification: notification,
        });
      }
    }
    res.status(200).json(userRequests);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching requests" });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { notificationId } = req.body;
    console.log(notificationId);
    const notification = await NotificationModel.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.acceptStatus) {
      return res.status(400).json({ error: "Request already accepted" });
    }
    // Update the acceptStatus to true
    notification.acceptStatus = true;
    await notification.save();
    res.status(200).json({ message: "Request accepted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
};

export const getAcceptedRequests = async (req, res) => {
  try {
    const { lawyerId } = req.params;

    // Find accepted notifications for the given lawyer
    const acceptedNotifications = await NotificationModel.find({
      lawyerid: lawyerId,
      acceptStatus: true,
    });

    if (acceptedNotifications.length === 0) {
      // No accepted notifications found for the lawyer
      return res.status(404).json({ message: "No accepted notifications found" });
    }

    // Extract user IDs from accepted notifications
    const userIds = acceptedNotifications.map((notification) => notification.userid);

    // Find the corresponding users from the User model
    const acceptedUsers = await UserModel.find({ _id: { $in: userIds } });

    if (acceptedUsers.length === 0) {
      // No users found with acceptStatus true
      return res.status(404).json({ message: "No accepted users found" });
    }

    res.status(200).json({ acceptedUsers });
  } catch (error) {
    console.error("Error while fetching accepted requests:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const deleteRequest = async (req, res) => {
  try {
    const { notificationId } = req.body;

    // Find the notification by its ID and delete it
    const deletedNotification = await NotificationModel.findByIdAndDelete(
      notificationId
    );

    if (!deletedNotification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ message: "Request is declined" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
};

export const deleteAllRequests = async (req, res) => {
  try {
    // Check if there are any notifications
    const count = await NotificationModel.countDocuments();

    if (count === 0) {
      return res.status(404).json({ message: "No notifications found" });
    }

    // Delete all notifications from the Notification model
    await NotificationModel.deleteMany({});

    res.status(200).json({ message: "All requests are deleted" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
};
