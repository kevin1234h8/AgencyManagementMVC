using AgencyManagementCore;
using AgencyManagementCore.Models;
using AgencyManagementMVC.Models.Home;
using NLog;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace AgencyManagementMVC.Controllers
{
    [SessionState(System.Web.SessionState.SessionStateBehavior.ReadOnly)]
    public class HomeController : Controller
    {
        public Logger logger = LogManager.GetCurrentClassLogger();
        public ActionResult Index()
        {
            return RedirectToAction("Settings");
        }

        [Route("Settings")]
        public ActionResult Settings()
        {
            logger.Trace(Labels.TitleSettings + ": Index");
            //var action = Auth(Labels.NameSettings);
            //if (action != null)
            //{
            //    RedirectUrl url = (RedirectUrl)action.Data;
            //    return Redirect(url.Address);
            //}

            ViewBag.AppName = Labels.AppName;
            ViewBag.Title = Labels.TitleSettings;
            return View("Settings");
        }

        [Route("Reports")]
        public ActionResult Reports()
        {
            ViewBag.AppName = Labels.AppName;
            ViewBag.Title = Labels.TitleReports;
            return View();
        }

        public JsonResult Auth(string pageName)
        {
            return null;
            //logger.Trace(pageName + ": Auth");
            //RedirectUrl url = new RedirectUrl();
            //if (!PageLockController.AuthGroup(Properties.Settings.Default.AdminGroup))
            //{
            //    logger.Warn("user does not has valid group, redirecting (default:404)");
            //    url.Address = Properties.Settings.Default.NotFoundAddress;
            //    return Json(url);
            //}

            //var response = PageLockController.PageLock(-1, Labels.AppName);
            //response.RetryUrl = Url.Action(pageName, "Home");
            //if (response.Status == "locked")
            //{
            //    url.Address = Url.Action("Index", "PageLock", response);
            //    return Json(url);
            //}
            //else
            //{
            //    return null;
            //}
        }

        [HttpPost]
        public async Task<ActionResult> GetSettings(SettingsOption option)
        {
            logger.Trace(Labels.TitleSettings + ": GetSettings");
            var action = Auth(Labels.NameSettings);
            if (action != null) return action;

            SettingsModel model = new SettingsModel();
            List<Task> tasks = new List<Task>();

            try
            {
                if (option.Update == "all")
                {
                    var currentContext = System.Web.HttpContext.Current;
                    tasks.Add(Task.Run(async () => model.General = await SettingsControllerAccess.GetGeneralSettings()));
                    tasks.Add(Task.Run(async () => model.Folders = await CommonControllerAccess.GetFolders()));
                    tasks.Add(Task.Run(async () => model.Users = await CommonControllerAccess.GetNonSysAdminUsers()));
                }

                tasks.Add(Task.Run(async () => model.Storage = await SettingsControllerAccess.GetVVIPStorageSettings(option.Update)));

                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                logger.Error("Failed to get settings: " + ex.Message);
                logger.Trace(ex.StackTrace);
                return ReturnError(500, "Error when getting the settings, please contact you administrator.");
            }

            return Json(model);
        }

        [HttpGet]
        public async Task<ActionResult> GetDivisionList()
        {
            logger.Trace(Labels.TitleReports + ": GetDivisionList");
            //if (!PageLockController.AuthGroup(Properties.Settings.Default.AdminGroup))
            //{
            //    logger.Warn("user does not has valid group, redirecting (default:404)");
            //    return Redirect(Properties.Settings.Default.NotFoundAddress);
            //}

            try
            {
                List<CSNode> divisions = await CommonControllerAccess.GetFolders();
                return Json(divisions, JsonRequestBehavior.AllowGet);
            }
            catch (Exception ex)
            {
                logger.Error("Failed to get agency items: " + ex.Message);
                logger.Trace(ex.StackTrace);
                return ReturnError(500, "Error when getting the division list, please contact you administrator.");
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetDivisionInfo(DivisionOption option)
        {
            logger.Trace(Labels.TitleReports + ": GetDivisionInfo");
            var action = Auth(Labels.NameReports);
            if (action != null) return action;

            try
            {
                DivisionSetting model = await SettingsControllerAccess.GetDivisionInfo(option.CSID);
                return Json(model);
            }
            catch (Exception ex)
            {
                logger.Error("Failed to get agency settings: " + ex.Message);
                logger.Trace(ex.StackTrace);
                return ReturnError(500, "Error when getting the division info, please contact you administrator.");
            }

        }

        [HttpPost]
        public async Task<ActionResult> UpdateSettings([Bind(Exclude = "Folders, Users")] SettingsModel model)
        {
            logger.Trace(Labels.TitleSettings + ": UpdateSettings");
            var action = Auth(Labels.NameSettings);
            if (action != null) return action;
            SettingsModel result = new SettingsModel();
            List<Task> tasks = new List<Task>();
            try
            {
                if (model.Storage == null) //to hanlde if the user deletes all vvip storages
                {
                    model.Storage = new List<StorageSetting>();
                }

                tasks.Add(Task.Run(async () => result.Storage = await SettingsControllerAccess.UpdateVVIPStorageSettings(model.Storage)));

                if (model.General != null) //as no delete in general settings, we just make sure there is a value to be saved
                    tasks.Add(Task.Run(async () => result.General = await SettingsControllerAccess.UpdateGeneralSettings(model.General)));

                await Task.WhenAll(tasks);
                return Json(result);
            }
            catch (Exception ex)
            {
                logger.Error("Failed to save settings: " + ex.Message);
                logger.Trace(ex.StackTrace);
                return ReturnError(500, "Error when updating the settings, please contact you administrator.");
            }
        }

        [HttpPost]
        public async Task<ActionResult> UpdateDivisionInfo([Bind(Exclude = "Action, UtilizedSize, Type")] DivisionSetting setting)
        {
            logger.Trace(Labels.TitleSettings + ": UpdateDivisionInfo");
            var action = Auth(Labels.NameSettings);
            if (action != null) return action;

            try
            {
                DivisionSetting result = await SettingsControllerAccess.UpdateDivisionInfo(setting);
                return Json(result);
            }
            catch (Exception ex)
            {
                logger.Error("Failed to save settings: " + ex.Message);
                logger.Trace(ex.StackTrace);
                return ReturnError(500, "Error when updating the division info, please contact you administrator.");
            }
        }

        [HttpPost]
        public async Task<ActionResult> GetFolders(string username, string id)
        {
            List<Object> json = new List<Object>();
            List<FolderInfo> subFolders = new List<FolderInfo>();
            List<string> before = new List<string>();
            List<Task> tasks = new List<Task>();
            try
            {
                tasks.Add(Task.Run(async () => subFolders = await SettingsControllerAccess.ListSubFolders(username, id)));
                tasks.Add(Task.Run(async () => before = await SettingsControllerAccess.GetBeforeName(id)));
                //var watch = new Stopwatch();
                //watch.Start();
                //subFolders = await SettingsControllerAccess.ListSubFolders(username, id);
                //before = await SettingsControllerAccess.GetBeforeName(id);
                //watch.Stop();
                //logger.Info("time to get ancestor name: " + watch.ElapsedMilliseconds);
                await Task.WhenAll(tasks);

                before.Reverse();

                //This packages a json file to be sent back to the page
                //Retrieved by doing response[0] for file structure or response[1] for subfolders
                json.Add(before);
                json.Add(subFolders);
            }
            catch (Exception ex)
            {
                logger.Error("Failed to save settings: " + ex.Message);
                logger.Trace(ex.StackTrace);
                return ReturnError(500, "Error when getting the folder info, please contact you administrator.");
            }
            return Json(json);
        }

        private HttpStatusCodeResult ReturnError(int statusCode, string message)
        {
            return new HttpStatusCodeResult(statusCode, message);
        }
    }
}