using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using AgencyManagementCore;

namespace AgencyManagementMVC.Controllers
{
    public class PageLockController : Controller
    {
        private static readonly NLog.Logger logger = NLog.LogManager.GetCurrentClassLogger();
        // GET: PageLock
        public ActionResult Index([Bind(Exclude = "Status")]PageLockResponse response)
        {
            logger.Trace("Page Lock: GetCentralAdminSettings");
            if (response.Name == null)
            {
                return Redirect(Properties.Settings.Default.NotFoundAddress);
            }

            ViewBag.AppName = "Page Lock";
            ViewBag.Name = response.Name;
            ViewBag.Time = response.Time;
            ViewBag.RetryUrl = response.RetryUrl;
            return View("Locked");
        }

        public static bool AuthGroup(string groupName)
        {
            logger.Trace("Page Lock: AuthGroup");
            return CommonControllerAccess.IsUsermemberOfGroup(
                Properties.Settings.Default.TestUserName, groupName
            );
        }

        public static PageLockResponse PageLock(long nodeID, string appName)
        {
            logger.Trace("Page Lock: PageLock");
            return CommonControllerAccess.PageLock(
                Properties.Settings.Default.TestUserName, nodeID, appName, Properties.Settings.Default.PageLockExpirationMin
            );
        }

        [HttpGet]
        public ActionResult PageUnlock(long nodeID, string appName, string url = null, bool isAsync = false)
        {
            logger.Trace("Page Lock: PageUnlock");
            var result = CommonControllerAccess.PageUnlock(
                Properties.Settings.Default.TestUserName,
                nodeID,
                appName,
                Properties.Settings.Default.PageLockExpirationMin);

            if (isAsync)
                return null;
            else if (string.IsNullOrWhiteSpace(url))
                return Redirect(Properties.Settings.Default.UnlockRedirectAddress);
            else
                return Redirect(url);
        }
    }
}