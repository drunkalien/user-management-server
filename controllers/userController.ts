import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import User from "../models/userModel";

enum STATUS_CODES {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    const token = jwt.sign({ id: user?.id }, "secret");

    res.status(STATUS_CODES.CREATED).json({
      sucess: true,
      user,
      token,
    });
  } catch (error) {
    console.log(error);
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        erorr: "Invalid username or password!",
      });
    }

    if (!user?.isActive) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        erorr: "Unauthorized!",
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, user?.password!);

    if (!isMatch) {
      console.log(isMatch);
      res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        erorr: "Unauthorized!",
      });
    }

    const token = jwt.sign({ id: user?.id }, "secret");

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    let token: string = "";

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        error: "Unauthorized",
      });
    }

    const decoded: any = jwt.verify(token, "secret");
    const user = await User.findById(decoded.id);

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate({ id: req.params.id }, req.body);
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
  }
};

export const blockUsers = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;

    async function block() {
      for (let userId of userIds) {
        const user = await User.findById(userId);

        if (!user) {
          continue;
        }

        user.isActive = false;
        await user.save();
      }
    }

    await block();

    const users = await User.find();
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
  }
};

export const unblockUsers = async (req: Request, res: Response) => {
  try {
    async function unblock() {
      const { userIds } = req.body;

      for (let userId of userIds) {
        const user = await User.findById(userId);

        if (!user) {
          continue;
        }

        user.isActive = true;
        await user.save();
      }
    }

    await unblock();

    const users = await User.find();

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteUsers = async (req: Request, res: Response) => {
  try {
    const { userIds } = req.body;

    async function deleteSelcted() {
      for (let id of userIds) {
        await User.findByIdAndDelete(id);
      }
    }

    await deleteSelcted();

    const users = await User.find();
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log(error);
  }
};

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string = "";

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      error: "Unauthorized",
    });
  }

  const decoded: any = jwt.verify(token, "secret");
  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      error: "Email or password invalid!",
    });
  }

  if (user && !user?.isActive) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({
      success: false,
      error: "Unauthorized",
    });
  }

  if (user && user.isActive) {
    next();
  }
};
