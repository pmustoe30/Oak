﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Oak;
using System.Web.Mvc;
using Oak.Models;

namespace DynamicBlog.Models
{
    public class Blog : DynamicModel
    {
        Comments comments;

        public Blog()
            : this(new { Title = "", Body = "" })
        {

        }

        public Blog(object valueType)
            : base(valueType)
        {
            comments = new Comments();
        }

        public override bool IsValid()
        {
            if (string.IsNullOrEmpty(MixWith.Title)) return false;

            return true;
        }

        public string Message()
        {
            if(!IsValid())
            {
                return "Invalid Blog, please correct errors and try again.";
            }

            return "";
        }

        public void AddComment(string comment)
        {
            comments.Insert(new { BlogId = MixWith.Id, Text = comment });
        }

        public List<dynamic> Comments()
        {
            return (comments.All("BlogId = @0", "", 0, "*", MixWith.Id) as IEnumerable<dynamic>).ToList();
        }

        public string Summary
        {
            get
            {
                if (MixWith.Body == null) return "";

                if (MixWith.Body.Length > 50) return MixWith.Body.Substring(0, 50);

                return MixWith.Body;
            }
        }
    }
}